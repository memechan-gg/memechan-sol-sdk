import { Connection, clusterApiUrl } from "@solana/web3.js";

export function createSolanaConnection() {
  const connection = new Connection(clusterApiUrl("devnet"), "confirmed");
  return connection;
}
