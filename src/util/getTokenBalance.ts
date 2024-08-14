import { ASSOCIATED_TOKEN_PROGRAM_ID, getAssociatedTokenAddressSync } from "@solana/spl-token";
import { Connection, PublicKey } from "@solana/web3.js";
import { TOKEN_PROGRAM_ID } from "../config/consts";

/**
 * Fetches the token balance for a given mint and owner address.
 *
 * @param connection - The Solana connection object.
 * @param mintAddress - The mint address of the token.
 * @param ownerAddress - The owner's wallet address.
 * @returns A promise that resolves to the token balance as a string, or null if the ATA doesn't exist.
 */
export async function getTokenBalance(
  connection: Connection,
  mintAddress: PublicKey,
  ownerAddress: PublicKey,
): Promise<string | null> {
  try {
    const ataAddress = getAssociatedTokenAddressSync(
      mintAddress,
      ownerAddress,
      true,
      TOKEN_PROGRAM_ID,
      ASSOCIATED_TOKEN_PROGRAM_ID,
    );

    const ata = await connection.getAccountInfo(ataAddress);

    if (ata) {
      const info = await connection.getTokenAccountBalance(ataAddress);
      return info.value.amount;
    } else {
      console.log(`ATA not found for mint ${mintAddress.toBase58()} and owner ${ownerAddress.toBase58()}`);
      return null;
    }
  } catch (error) {
    console.error("Error fetching token balance:", error);
    throw error;
  }
}
