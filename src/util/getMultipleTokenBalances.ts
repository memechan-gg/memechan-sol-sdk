import { Connection, PublicKey } from "@solana/web3.js";

export async function getMultipleTokenBalances(connection: Connection, addresses: PublicKey[]): Promise<bigint[]> {
  const { getMultipleAccounts } = await import("@solana/spl-token");
  const parsedAccounts = getMultipleAccounts(connection, addresses);
  return (await parsedAccounts).map((account) => account.amount);
}
