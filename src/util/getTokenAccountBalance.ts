import { getAssociatedTokenAddressSync } from "@solana/spl-token";
import { Connection, PublicKey } from "@solana/web3.js";

export async function getTokenBalanceForWallet(connection: Connection, mint: PublicKey, wallet: PublicKey) {
  const ata = getAssociatedTokenAddressSync(wallet, mint);
  const info = await connection.getTokenAccountBalance(ata, "confirmed");
  return info.value.amount;
}
