import { Connection, PublicKey } from "@solana/web3.js";
import BigNumber from "bignumber.js";
import { POINTS_MINT, TOKEN_INFOS } from "../../src"; // Adjust the import path as needed
import { getTokenBalance } from "../util/getTokenBalance";

/**
 * Fetches and formats the POINTS token balance for a given owner address.
 *
 * @param connection - The Solana connection object.
 * @param ownerAddress - The owner's wallet address.
 * @returns A promise that resolves to the formatted POINTS balance as a BigNumber, or null if the ATA doesn't exist.
 */
export async function getFormattedPointsBalance(
  connection: Connection,
  ownerAddress: PublicKey,
): Promise<BigNumber | null> {
  try {
    const balance = await getTokenBalance(connection, POINTS_MINT, ownerAddress);

    if (balance !== null) {
      return new BigNumber(balance).div(10 ** TOKEN_INFOS.POINT.decimals);
    } else {
      console.log(`No Associated Token Account found for POINTS and owner ${ownerAddress.toBase58()}`);
      return null;
    }
  } catch (error) {
    console.error("Error fetching formatted POINTS balance:", error);
    throw error;
  }
}
