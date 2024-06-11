import { PublicKey } from "@solana/web3.js";
import BigNumber from "bignumber.js";
import { TokenAccount, isErrorResult, validateTokenAccountResponseData } from "./typeguard";
import { sleep } from "../common/helpers";
import { TokenAccountWithBNAmount } from "./types";
import { sortByAmount } from "./utils";

/**
 * Service class for handling helius-related calls.
 */
export class HeliusApi {
  /**
   * Constructs a new HeliusApi instance.
   * @param {string} heliusUrl - Helius private DAS api (not rpc one)
   */
  constructor(private heliusUrl: string) {}

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

  public async getAllTransactionsByAddress({ presaleAddress, startPresaleTimestamp, endPresaleTimestamp }) {}
}
