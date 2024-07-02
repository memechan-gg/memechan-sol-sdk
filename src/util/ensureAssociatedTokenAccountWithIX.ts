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
    getAccount,
    createAssociatedTokenAccountInstruction,
    getAssociatedTokenAddressSync,
    TOKEN_PROGRAM_ID,
    ASSOCIATED_TOKEN_PROGRAM_ID,
  } = await import("@solana/spl-token");
  const { connection, payer, owner, mint, transaction } = args;
  const associatedTokenAddress = getAssociatedTokenAddressSync(
    mint,
    owner,
    true,
    TOKEN_PROGRAM_ID,
    ASSOCIATED_TOKEN_PROGRAM_ID,
  );

  try {
    await getAccount(connection, associatedTokenAddress);
  } catch (error) {
    const createAssociatedTokenAccountIX = createAssociatedTokenAccountInstruction(
      payer,
      associatedTokenAddress,
      owner,
      mint,
      TOKEN_PROGRAM_ID,
      ASSOCIATED_TOKEN_PROGRAM_ID,
    );
    transaction.add(createAssociatedTokenAccountIX);
  }

  return associatedTokenAddress;
}
