import { createBurnInstruction, getAssociatedTokenAddressSync } from "@solana/spl-token";
import { Transaction } from "@solana/web3.js";
import { PublicKey } from "@solana/web3.js";

export interface BurnTokensArgs {
  user: PublicKey;
  tokenAccount?: PublicKey;
  mint: PublicKey;
  amount: bigint;
  transaction?: Transaction;
}

export function getBurnTransaction(args: BurnTokensArgs): Transaction {
  const { mint, user, amount } = args;
  const tokenAccount = args.tokenAccount ?? getAssociatedTokenAddressSync(mint, user);
  const tx = args.transaction ?? new Transaction();

  tx.add(createBurnInstruction(tokenAccount, mint, user, amount));

  return tx;
}
