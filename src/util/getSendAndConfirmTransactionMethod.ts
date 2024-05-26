import {
  ComputeBudgetProgram,
  ConfirmOptions,
  Connection,
  Signer,
  Transaction,
  sendAndConfirmTransaction,
} from "@solana/web3.js";
import { COMPUTE_UNIT_PRICE } from "../config/config";

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
    const latestBlockhash = await connection.getLatestBlockhash("confirmed");
    console.log("Latest blockhash: ", latestBlockhash);
    transaction.recentBlockhash = latestBlockhash.blockhash;
    transaction.lastValidBlockHeight = latestBlockhash.lastValidBlockHeight;

    const computeUnitPriceInstruction = ComputeBudgetProgram.setComputeUnitPrice({
      microLamports: COMPUTE_UNIT_PRICE,
    });

    // Retrieve existing instructions
    const existingInstructions = transaction.instructions;

    const hasComputeUnitInstruction = existingInstructions.some((instr) =>
      instr.programId.equals(ComputeBudgetProgram.programId),
    );

    // Prepend new instructions if not already present
    const updatedInstructions = hasComputeUnitInstruction
      ? existingInstructions
      : [computeUnitPriceInstruction, ...existingInstructions];

    // Create a new transaction with the updated instructions
    const updatedTransaction = new Transaction().add(...updatedInstructions);

    const tx = await sendAndConfirmTransaction(connection, updatedTransaction, signers, options);
    console.log("Transaction confirmed: ", tx);
  };
}
