import { sendAndConfirmTransaction, PublicKey, Transaction, ComputeBudgetProgram } from "@solana/web3.js";
import { withdrawAdminFee } from "../../src/schema/codegen/instructions";
import { BoundPoolClient, COMPUTE_UNIT_PRICE } from "../../src";
import { client, payer } from "../common";

// BE AWARE! `payer` must be admin keypair for calling this endpoint

// yarn tsx examples/fee/withdraw-admin-fee.ts
export const withdrawAdminFeeExample = async () => {
  const boundPoolAddress = new PublicKey("5jPvnanTcuGHLBpvFmnxYVLShXwz6ii2veZ7o5FELdcw");
  const boundPoolInfo = await BoundPoolClient.fetch2(client.connection, boundPoolAddress);

  console.debug("boundPoolInfo.toJSON(): ", boundPoolInfo.toJSON());

  //   return;

  const boundPoolSignerPda = BoundPoolClient.findSignerPda(boundPoolAddress, client.memechanProgram.programId);

  const transaction = new Transaction();

  const { TOKEN_PROGRAM_ID } = await import("@solana/spl-token");

  const withdrawFeeInstruction = withdrawAdminFee({
    boundPoolSignerPda,
    feeVaultQuote: boundPoolInfo.feeVaultQuote,
    pool: boundPoolAddress,
    poolQuoteVault: boundPoolInfo.quoteReserve.vault,
    sender: payer.publicKey,
    tokenProgram: TOKEN_PROGRAM_ID,
  });

  const addPriorityFee = ComputeBudgetProgram.setComputeUnitPrice({
    microLamports: COMPUTE_UNIT_PRICE,
  });

  transaction.add(addPriorityFee);
  transaction.add(withdrawFeeInstruction);

  const res = await sendAndConfirmTransaction(client.connection, transaction, [payer]);

  console.debug("res: ", res);
};

withdrawAdminFeeExample();
