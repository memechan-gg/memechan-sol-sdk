import { Connection, PublicKey } from "@solana/web3.js";

export async function getTokenBalanceForWallet(connection: Connection, mint: PublicKey, wallet: PublicKey) {
  const { getAssociatedTokenAddressSync } = await import("@solana/spl-token");
  const ata = getAssociatedTokenAddressSync(wallet, mint);
  const info = await connection.getTokenAccountBalance(ata, "confirmed");
  return info.value.amount;
}
