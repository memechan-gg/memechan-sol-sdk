import BigNumber from "bignumber.js";
import { removeDecimalPart } from "./removeDecimalPart";
import { BN } from "@coral-xyz/anchor";

/**
 * Normalizes the input amount for a specific coin type depending on the provided coin decimals.
 * Note: Removing the decimal part in case client send number with more decimal part
 * than this particular token has decimal places allowed (`inputCoinDecimals`)
 * That's prevent situation when casting BigNumber to BN fails with error ("Cannot convert 183763562.1 to a BigInt")
 * @param {string} inputAmount - The input amount before normalization.
 * @param {number} inputCoinDecimals - The number of decimals for the coin type.
 * @return {BN} The normalized input amount.
 */
export function normalizeInputCoinAmountBN(inputAmount: string, inputCoinDecimals: number): BN {
  // Convert input amount to BigNumber with specified decimals
  const inputAmountWithDecimalsBigNumber: BigNumber = new BigNumber(inputAmount).multipliedBy(10 ** inputCoinDecimals);

  // Remove decimal part to prevent casting errors
  const inputAmountWithoutExceededDecimalPart: BigNumber = removeDecimalPart(inputAmountWithDecimalsBigNumber);

  // Convert to BN
  const normalizedInputAmount: BN = new BN(inputAmountWithoutExceededDecimalPart.toString());

  return normalizedInputAmount;
}
