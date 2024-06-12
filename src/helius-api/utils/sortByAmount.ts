import { TokenAccountWithBNAmount } from "../types";

/**
 * Sorts an array of TokenAccountWithBNAmount objects by the amountBN property in descending order.
 * @param {TokenAccountWithBNAmount[]} array - The array to sort.
 * @return {TokenAccountWithBNAmount[]} The sorted array.
 */
export function sortByAmount(array: TokenAccountWithBNAmount[]): TokenAccountWithBNAmount[] {
  return array.sort((a, b) => {
    return b.amount.comparedTo(a.amount);
  });
}
