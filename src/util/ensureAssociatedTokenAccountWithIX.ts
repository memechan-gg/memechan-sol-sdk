import { Connection, PublicKey, Transaction } from "@solana/web3.js";

export interface EnsureAssociatedTokenAccountWithIXArgs {
  connection: Connection;
  payer: PublicKey;
  owner: PublicKey;
  mint: PublicKey;
  transaction: Transaction;
}

export async function ensureAssociatedTokenAccountWithIX(
  args: EnsureAssociatedTokenAccountWithIXArgs,
): Promise<PublicKey> {
  const {
    getAssociatedTokenAddressSync,
    createAssociatedTokenAccountIdempotentInstruction,
    TOKEN_PROGRAM_ID,
    ASSOCIATED_TOKEN_PROGRAM_ID,
  } = await import("@solana/spl-token");
  const { payer, owner, mint, transaction } = args;
  const associatedTokenAddress = getAssociatedTokenAddressSync(
    mint,
    owner,
    true,
    TOKEN_PROGRAM_ID,
    ASSOCIATED_TOKEN_PROGRAM_ID,
  );

  transaction.add(
    createAssociatedTokenAccountIdempotentInstruction(
      payer,
      associatedTokenAddress,
      owner,
      mint,
      TOKEN_PROGRAM_ID,
      ASSOCIATED_TOKEN_PROGRAM_ID,
    ),
  );

  return associatedTokenAddress;
}
