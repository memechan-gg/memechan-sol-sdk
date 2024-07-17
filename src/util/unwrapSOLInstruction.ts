import { ASSOCIATED_TOKEN_PROGRAM_ID, TOKEN_PROGRAM_ID } from "@raydium-io/raydium-sdk";
import { PublicKey } from "@solana/web3.js";

export const unwrapSOLInstruction = async (walletPublicKey: PublicKey) => {
  const { NATIVE_MINT, createCloseAccountInstruction, getAssociatedTokenAddressSync } = await import(
    "@solana/spl-token"
  );
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
  } else {
    console.log("wSolATAAccount is null");
  }

  return null;
};
