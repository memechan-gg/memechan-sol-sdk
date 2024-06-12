import { Transaction } from "@solana/web3.js";

export const getTxCopy = (tx: Transaction) => {
  const txCopy = new Transaction();
  txCopy.add(tx);

  return txCopy;
};
