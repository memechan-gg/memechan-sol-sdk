import { ConfirmOptions, Connection, Signer, Transaction, sendAndConfirmTransaction } from "@solana/web3.js";

export function getSendAndConfirmTransactionMethod({
  connection,
  transaction,
  signers,
  options = {
    commitment: "confirmed",
    skipPreflight: true,
    preflightCommitment: "confirmed",
  },
}: {
  connection: Connection;
  transaction: Transaction;
  signers: Signer[];
  options?: ConfirmOptions;
}): () => Promise<void> {
  return async () => {
    const tx = await sendAndConfirmTransaction(connection, transaction, signers, options);
    console.log("Transaction confirmed: ", tx);
  };
}
