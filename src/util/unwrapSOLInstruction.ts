import { NATIVE_MINT, createCloseAccountInstruction, getAssociatedTokenAddressSync } from "@solana/spl-token";
import { PublicKey } from "@solana/web3.js";

/** Address of the SPL Token program */
const TOKEN_PROGRAM_ID = new PublicKey("TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA");

/** Address of the SPL Associated Token Account program */
const ASSOCIATED_TOKEN_PROGRAM_ID = new PublicKey("ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL");

export const unwrapSOLInstruction = (walletPublicKey: PublicKey) => {
  const wSolATAAccount = getAssociatedTokenAddressSync(
    NATIVE_MINT,
    walletPublicKey,
    true,
    TOKEN_PROGRAM_ID,
    ASSOCIATED_TOKEN_PROGRAM_ID,
  );

  if (wSolATAAccount) {
    const closedWrappedSolInstruction = createCloseAccountInstruction(
      wSolATAAccount,
      walletPublicKey,
      walletPublicKey,
      [],
      TOKEN_PROGRAM_ID,
    );
    return closedWrappedSolInstruction;
  }
  return null;
};
