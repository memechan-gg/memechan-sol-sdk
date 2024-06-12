/* eslint-disable max-len */
import BigNumber from "bignumber.js";
import { CHAN_TOKEN_DECIMALS, DECIMALS_S, PRESALE_ADDRESS } from "../../../src";
import { TransactionDataByDigest } from "../../../src/helius-api/typeguards/txTypeguard";
import { HeliusApiInstance } from "../../common";
import { readDataFromJsonFile, saveDataToJsonFile } from "../../utils";

// yarn tsx examples/helius-api/from-json/get-applied-bonus-data.ts > log.txt 2>&1
(async () => {
  const parsedDataList: TransactionDataByDigest[] = (await readDataFromJsonFile(
    "tx-parsed-tx-data-for-pre-sale-address-AXen9e3RFS46k8n29TLsUc65ngnyPCB6L2pazyLZQEX5",
  )) as TransactionDataByDigest[];

  console.debug("parsedDataList: ", parsedDataList);

  const { aggregatedTxsByOwnerList } = HeliusApiInstance.processAllParsedTransactions({
    parsedTransactionsList: parsedDataList,
    targetAddress: PRESALE_ADDRESS.toString(),
    // fromTimestamp: 1717459200,
    // toTimestamp: 1717894800,
    // TODO: Add timestampFrom and timestampTo
  });

  const bonusListRaw = await readDataFromJsonFile("bonus-list");
  if (!bonusListRaw) {
    throw new Error("empty bonus list");
  }

  const bonusSignatureList = Object.keys(bonusListRaw);

  const { bonusAppliedData } = HeliusApiInstance.getAppliedBonusDataByUser({
    aggregatedListByUserAmounts: aggregatedTxsByOwnerList,
    bonusSignatureList,
  });
  console.debug("aggregatedTxsByOwnerListSize: ", bonusAppliedData.length);

  const {
    userAllocations,
    totalAmountExcludingBonus,
    totalAmountInludingBonus,
    totalUserAllocationsIncludingBonus,
    totalUserAllocationsExcludingBonus,
  } = HeliusApiInstance.calculateUserAllocations(bonusAppliedData);

  // totals
  console.debug(`Total amount (including bonus) (raw): ${totalAmountInludingBonus.toString()}`);
  console.debug(`Total amount (excluding bonus) (raw): ${totalAmountExcludingBonus.toString()}`);

  console.debug(`Total amount (including bonus) (SOL): ${totalAmountInludingBonus.dividedBy(DECIMALS_S).toString()}`);
  console.debug(`Total amount (excluding bonus) (SOL): ${totalAmountExcludingBonus.dividedBy(DECIMALS_S).toString()}`);

  // totals by users
  console.debug(`Total amount by users (including bonus) (raw): ${totalUserAllocationsIncludingBonus.toString()}`);
  console.debug(`Total amount by users (excluding bonus) (raw): ${totalUserAllocationsExcludingBonus.toString()}`);

  console.debug(
    `Total amount by users (including bonus) (CHAN): ${totalUserAllocationsIncludingBonus.dividedBy(10 ** CHAN_TOKEN_DECIMALS).toString()}`,
  );
  console.debug(
    `Total amount by users (excluding bonus) (CHAN): ${totalUserAllocationsExcludingBonus.dividedBy(10 ** CHAN_TOKEN_DECIMALS).toString()}`,
  );

  // little processing
  const userTokenAllocationDataFinal = userAllocations.map((el) => ({
    account: el.user,
    amount: el.tokenAllocationIncludingBonus,
    amountUI: el.tokenAllocationIncludingBonus.dividedBy(10 ** CHAN_TOKEN_DECIMALS),
  }));

  const allUserTokenAmounts = userTokenAllocationDataFinal.reduce(
    (acc, el) => acc.plus(new BigNumber(el.amount)),
    new BigNumber(0),
  );

  console.debug(`allUserTokenAmounts ${allUserTokenAmounts.toString()}`);
  console.debug(`allUserTokenAmounts ${allUserTokenAmounts.dividedBy(10 ** CHAN_TOKEN_DECIMALS).toString()}`);

  saveDataToJsonFile(bonusAppliedData, "get-applied-bonus-data");
  saveDataToJsonFile(userAllocations, "users-allocations-data");
  saveDataToJsonFile(userTokenAllocationDataFinal, "chan-token-allocations-by-user-final");
})();
