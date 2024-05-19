import { TOKEN_PROGRAM_ID, createInitializeAccountInstruction, getAccountLenForMint, getMint } from "@solana/spl-token";
import {
  Connection,
  Signer,
  PublicKey,
  Keypair,
  Commitment,
  Transaction,
  SystemProgram,
  TransactionInstruction,
} from "@solana/web3.js";

export async function getCreateAccountInstructions(
  connection: Connection,
  payer: Signer,
  mint: PublicKey,
  owner: PublicKey,
  keypair: Keypair,
  commitment?: Commitment,
  programId = TOKEN_PROGRAM_ID,
): Promise<TransactionInstruction[]> {
  const mintState = await getMint(connection, mint, commitment, programId);
  const space = getAccountLenForMint(mintState);
  const lamports = await connection.getMinimumBalanceForRentExemption(space);

  const transaction = new Transaction().add(
    SystemProgram.createAccount({
      fromPubkey: payer.publicKey,
      newAccountPubkey: keypair.publicKey,
      space,
      lamports,
      programId,
    }),
    createInitializeAccountInstruction(keypair.publicKey, mint, owner, programId),
  );

  return transaction.instructions;
}
