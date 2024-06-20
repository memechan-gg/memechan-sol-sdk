import { ASSOCIATED_TOKEN_PROGRAM_ID, TOKEN_PROGRAM_ID } from "@raydium-io/raydium-sdk";
import { NATIVE_MINT, createCloseAccountInstruction, getAssociatedTokenAddress } from "@solana/spl-token";
import { PublicKey } from "@solana/web3.js";

export const unwrapSOLInstruction = async (walletPublicKey: PublicKey) => {
  const wSolATAAccount = await getAssociatedTokenAddress(
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
