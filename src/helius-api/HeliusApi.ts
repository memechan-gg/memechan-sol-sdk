import { Connection, PublicKey } from "@solana/web3.js";
import BigNumber from "bignumber.js";
import { TokenAccount, isErrorResult, validateTokenAccountResponseData } from "./typeguards/typeguard";
import { sleep } from "../common/helpers";
import {
  AggregatedTxData,
  AggregatedTxDataWithBonus,
  FilteredOutTxsDataByReason,
  ParsedTxData,
  TokenAccountWithBNAmount,
  UserPercentageData,
} from "./types";
import { sortByAmount } from "./utils/sortByAmount";
import { getSignatures } from "./utils/getSignatures";
import { splitByChunk } from "../util/splitByChunk";
import { TransactionDataByDigest, isArrayOfTransactionDataByDigest } from "./typeguards/txTypeguard";
import { aggregateTxsByOwner } from "./utils/aggregateAmountByOwner";

/**
 * Service class for handling helius-related calls.
 */
export class HeliusApi {
  /**
   * Constructs a new HeliusApi instance.
   * @param {string} heliusUrl - Helius private DAS api (not rpc one)
   * @param {string} heliusApiKey - Helius api key
   */
  constructor(
    private heliusUrl: string,
    private heliusApiKey: string,
  ) {}

  public async getTokenHolders({ mint }: { mint: PublicKey }) {
    let page = 1;
    const allOwners: Map<string, BigNumber> = new Map();

    // eslint-disable-next-line no-constant-condition
    while (true) {
      console.debug(`[getTokenHolders] Fetching token holders for ${mint.toString()}, page ${page}`);

      const response = await fetch(this.heliusUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          jsonrpc: "2.0",
          method: "getTokenAccounts",
          id: "pats-holder-list-id",
          params: {
            page: page,
            limit: 1000,
            displayOptions: {},
            mint: mint.toBase58(),
          },
        }),
      });

      const data = await response.json();

      const validationCheck = validateTokenAccountResponseData(data);
      if (!validationCheck) {
        console.debug("[getTokenHolders]  Invalid data: ", data);
        throw new Error("[getTokenHolders] Invalid data");
      }

      const isErrorFromHelius = isErrorResult(data);
      if (isErrorFromHelius) {
        console.debug("[getTokenHolders] Error result from helius, data: ", data);
        throw new Error("[getTokenHolders] Error result from helius api");
      }

      if (!data.result || data.result.token_accounts.length === 0) {
        console.warn("[getTokenHolders] Helius API: No data present");
        break;
      }

      data.result.token_accounts.forEach((account: TokenAccount) => {
        const current = allOwners.get(account.owner);

        // if owner was already in the map (e.g. seems like multiple token accounts exists for 1 owner`)
        if (current) {
          console.debug(`account ${account.owner} already exists in map, summing amounts`);
          console.debug(`account ${account.owner} current amount ${current.toString()}, additional: ${account.amount}`);
          allOwners.set(account.owner, current.plus(account.amount));
        } else {
          allOwners.set(account.owner, new BigNumber(account.amount));
        }
      });

      // sleep to do not exceed Helius DAS API rate-limit
      await sleep(5_000);
      page++;
    }

    const allOwnersList: TokenAccountWithBNAmount[] = Array.from(allOwners.entries()).map((el) => ({
      account: el[0],
      amountBN: el[1],
    }));

    const sortedByAmountList = sortByAmount(allOwnersList);

    return { allOwners, allOwnersLength: allOwners.size, allOwnersList, sortedByAmountList };
  }

  public async getAllTransactionSingaturesByAddress({
    address,
    connection,
  }: {
    address: PublicKey;
    connection: Connection;
  }) {
    let count = 0;
    let signCount = 0;
    const txList = [];

    const signaturesProvider = getSignatures({
      connection,
      job: "findSignatureByPubkey",
      publicKey: address,
      limit: 1000,
      // eslint-disable-next-line max-len
      // untilTransactionSignature: "2f39jgK8NSA5pkYLjbDKsbVz2teYVev7rZEF2MYZSboE5fNUNLEsS4SdCAen8DJPAmgDrxngBGCqqBnXQWhtyPKs",
    });

    for await (const signatures of signaturesProvider) {
      if (!signatures.length) {
        console.log("[insertMissingAutoCompoundTransactions] no signatures ...");
        continue;
      }

      count++;
      signCount += signatures.length;
      txList.push(...signatures);

      console.log(
        "[getAllTransactionSingaturesByAddress]",
        `Processing batch number ${count} of ${signatures.length} signatures, total sign count: ${signCount}`,
      );
    }

    return {
      txSignatureList: txList,
      txSignatureListSize: txList.length,
    };
  }

  public async getAllParsedTransactions({ signatures }: { signatures: string[] }): Promise<{
    parsedDataList: TransactionDataByDigest[];
    parsedDataListSize: number;
  }> {
    const MAX_CHUNK_SIZE_FOR_HELIUS_API = 100;
    const signaturesChunks = splitByChunk(signatures, MAX_CHUNK_SIZE_FOR_HELIUS_API);

    const parsedDataList = [];
    let count = 0;
    let signCount = 0;

    // TODO: Handle errors
    for (const signatureChunk of signaturesChunks) {
      console.log(
        "[getAllParsedTransactions]",
        `Processing batch number ${count} of ${signatureChunk.length} signatures, total sign count: ${signCount}`,
      );

      const response = await fetch(`https://api.helius.xyz/v0/transactions?api-key=${this.heliusApiKey}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          transactions: signatureChunk,
        }),
      });
      const parsedSignaturesData = await response.json();

      const isValidTxData = isArrayOfTransactionDataByDigest(parsedSignaturesData);

      if (!isValidTxData) {
        console.debug("[getAllParsedTransactions] wrong shape of parsed tx data: ", parsedSignaturesData);
        throw new Error("[getAllParsedTransactions] wrong shape of parsed tx data");
      }

      count++;
      signCount += signatureChunk.length;
      parsedDataList.push(...parsedSignaturesData);

      // prevent rate-limit from helius api
      await sleep(100);
    }

    return { parsedDataList, parsedDataListSize: parsedDataList.length };
  }

  public processAllParsedTransactions({
    parsedTransactionsList,
    targetAddress,
    fromTimestamp,
    toTimestamp,
  }: {
    parsedTransactionsList: TransactionDataByDigest[];
    targetAddress: string;
    fromTimestamp?: number;
    toTimestamp?: number;
  }) {
    // Warn if fromTimestamp or toTimestamp is not set up
    if (fromTimestamp === undefined) {
      console.warn("[processAllParsedTransactions] fromTimestamp is not set up");
    }
    if (toTimestamp === undefined) {
      console.warn("[processAllParsedTransactions] toTimestamp is not set up");
    }

    const filteredOutTxsDataByReason: FilteredOutTxsDataByReason = {
      failedTxs: [],
      noNativeTransfer: [],
      notCorrespondingToTargetAddress: [],
      beforeFromTimestamp: [],
      afterToTimestamp: [],
    };

    const filteredOutFailedTxs = parsedTransactionsList.filter((tx) => {
      // filter out failed tx
      if (tx.transactionError !== null) {
        console.warn(`tx ${tx.signature} failed tx, filtering it out`);
        filteredOutTxsDataByReason.failedTxs.push(tx);
        return false;
      }

      // filter out txs that doesn't have native sol address
      if (tx.nativeTransfers.length === 0) {
        console.warn(`tx ${tx.signature} doesn't contain native transfer (SOL), filtering it out`);
        filteredOutTxsDataByReason.noNativeTransfer.push(tx);
        return false;
      }

      // filter out txs that are not corresponding to targetAddress
      if (tx.nativeTransfers.some((el) => el.toUserAccount !== targetAddress)) {
        console.warn(`tx ${tx.signature} doesn't contain target address as a destination one, filtering it out`);
        filteredOutTxsDataByReason.notCorrespondingToTargetAddress.push(tx);
        return false;
      }

      // filter out txs that are sent before fromTimestamp timestamp
      if (fromTimestamp !== undefined && tx.timestamp < fromTimestamp) {
        console.warn(`tx ${tx.signature} was sent before fromTimestamp, filtering it out`);
        filteredOutTxsDataByReason.beforeFromTimestamp.push(tx);
        return false;
      }

      // filter out txs that are sent after toTimestamp timestamp
      if (toTimestamp !== undefined && tx.timestamp > toTimestamp) {
        console.warn(`tx ${tx.signature} was sent after toTimestamp, filtering it out`);
        filteredOutTxsDataByReason.afterToTimestamp.push(tx);
        return false;
      }

      return true;
    });

    console.debug(
      `Filtred txs size: ${filteredOutFailedTxs.length}, initial txs: ${parsedTransactionsList.length}, 
      filtred: ${parsedTransactionsList.length - filteredOutFailedTxs.length}}`,
    );

    const parsedTxData: ParsedTxData[] = filteredOutFailedTxs.map((tx) => {
      // TODO: Maybe we should filter out them initially? (not a critical tho)
      const filtredTransferAmountsToDestination = tx.nativeTransfers.filter((el) => el.toUserAccount === targetAddress);

      if (filtredTransferAmountsToDestination.length > 1) {
        console.warn(`More than one transfer amount to destination for ${tx.signature}`);
      }

      const solTransferAmountsToDestination = filtredTransferAmountsToDestination.reduce((acc: BigNumber, el) => {
        return acc.plus(el.amount);
      }, new BigNumber(0));

      return {
        signature: tx.signature,
        timestamp: tx.timestamp,
        amountBN: solTransferAmountsToDestination,
        user: tx.feePayer,
      };
    });

    const aggregatedTxsByOwner = aggregateTxsByOwner(parsedTxData);
    const aggregatedTxsByOwnerList = Object.values(aggregatedTxsByOwner);

    return {
      filteredOutTxsDataByReason,
      notAggregatedByOwnerList: parsedTxData,
      aggregatedTxsByOwnerMap: aggregatedTxsByOwner,
      aggregatedTxsByOwnerList,
      aggregatedTxsByOwnerListSize: aggregatedTxsByOwnerList.length,
    };
  }

  public getAppliedBonusDataByUser({
    aggregatedListByUserAmounts,
    bonusSignatureList,
  }: {
    aggregatedListByUserAmounts: AggregatedTxData[];
    bonusSignatureList: string[];
  }) {
    const BONUS_PERCENTAGE = 5;

    // Create a map from the bonusSignatureList, trimming any extra spaces
    const bonusSignatureMap: Record<string, boolean> = {};
    bonusSignatureList.forEach((signature) => {
      const cleanSignature = signature.trim();
      bonusSignatureMap[cleanSignature] = true;
    });

    let totalBonusTxs = 0;

    // Process each AggregatedTxData to check for bonuses and modify accordingly
    const bonusAppliedData: AggregatedTxDataWithBonus[] = aggregatedListByUserAmounts.map((data) => {
      let hasBonus = false;

      // Check if any transferData signature matches the bonusSignatureMap
      data.transferData.forEach((transfer) => {
        const cleanSignature = transfer.signature.trim();
        const isTransferSignatureIsBonusSignature = bonusSignatureMap[cleanSignature];
        if (isTransferSignatureIsBonusSignature) {
          hasBonus = true;
          totalBonusTxs++;
        }
      });

      let totalIncludingBonusBN = data.totalBN;
      if (hasBonus) {
        const bonusAmount = data.totalBN.multipliedBy(BONUS_PERCENTAGE).dividedBy(100);
        totalIncludingBonusBN = data.totalBN.plus(bonusAmount);
      }

      console.debug(`User ${data.user} ${hasBonus ? "gets" : "does not get"} the bonus.`);

      return {
        ...data,
        bonus: hasBonus,
        totalIncludingBonusBN,
      };
    });

    console.debug(`All bonus txs length: ${bonusSignatureList.length}`);
    console.debug(`Applied bonus txs length: ${totalBonusTxs}`);

    return { bonusAppliedData };
  }

  public calculateUserPercentages(data: AggregatedTxDataWithBonus[]): {
    totalAmountInludingBonus: BigNumber;
    totalAmountExcludingBonus: BigNumber;
    userPercentages: UserPercentageData[];
  } {
    const totalAmountInludingBonus = data.reduce((acc, user) => acc.plus(user.totalIncludingBonusBN), new BigNumber(0));
    const totalAmountExcludingBonus = data.reduce((acc, user) => acc.plus(user.totalBN), new BigNumber(0));

    const userPercentages = data.map((user) => {
      const percentageOfTotalIncludingBonus = user.totalIncludingBonusBN
        .dividedBy(totalAmountInludingBonus)
        .multipliedBy(100);

      const percentageOfTotalExcludingBonus = user.totalBN.dividedBy(totalAmountExcludingBonus).multipliedBy(100);
      return {
        ...user,
        percentageOfTotalIncludingBonus,
        percentageOfTotalExcludingBonus,
      };
    });

    return {
      totalAmountInludingBonus,
      totalAmountExcludingBonus,
      userPercentages,
    };
  }
}
