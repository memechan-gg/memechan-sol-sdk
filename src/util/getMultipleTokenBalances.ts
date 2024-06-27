import { getMultipleAccounts } from "@memechan/spl-token";
import { Connection, PublicKey } from "@solana/web3.js";

export async function getMultipleTokenBalances(connection: Connection, addresses: PublicKey[]): Promise<bigint[]> {
  const parsedAccounts = getMultipleAccounts(connection, addresses);

  return (await parsedAccounts).map((account) => account.amount);
}
