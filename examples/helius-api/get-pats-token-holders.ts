import BigNumber from "bignumber.js";
import { PATS_MINT } from "../../src/config/config";
import { HeliusApiInstance } from "../common";
import { saveDataToJsonFile } from "../utils";

// yarn tsx examples/helius-api/get-pats-token-holders.ts
export const getTokenHoldersExample = async () => {
  const result = await HeliusApiInstance.getTokenHolders({ mint: PATS_MINT });
  // console.debug("result.sortedByAmountList: ", result.sortedByAmountList);

  saveDataToJsonFile(result.sortedByAmountList, "pats-holders-sorted-by-amount");

  // Checks
  const totalPatsAmount = result.sortedByAmountList.reduce((acc, el) => acc.plus(el.amount), new BigNumber(0));

  console.debug("totalPatsAmount: ", totalPatsAmount.toString());
};

getTokenHoldersExample();
