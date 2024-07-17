import { AggregatedTxData, ParsedTxData } from "../types";

/**
 * Aggregates transaction data by user, summarizing the total amountBN and including data for each transaction.
 * @param {ParsedTxData[]} parsedTxData - The parsed transaction data to aggregate.
 * @return {Record<string, AggregatedTxData>} The aggregated transaction data by user.
 */
export function aggregateTxsByOwner(parsedTxData: ParsedTxData[]): Record<string, AggregatedTxData> {
  return parsedTxData.reduce(
    (acc, el) => {
      // if there is no user yet
      if (!acc[el.user]) {
        acc[el.user] = {
          totalBN: el.amountBN,
          user: el.user,
          transferData: [el],
        };

        return acc;
      }

      // if particular user already has an amount
      console.warn(`User ${el.user} has multiple transfers.`);
      acc[el.user].totalBN = acc[el.user].totalBN.plus(el.amountBN);
      acc[el.user].transferData.push({
        signature: el.signature,
        timestamp: el.timestamp,
        amountBN: el.amountBN,
        user: el.user,
      });

      return acc;
    },
    {} as Record<string, AggregatedTxData>,
  );
}
