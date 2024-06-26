import { ParsedTransactionWithMeta, PublicKey } from "@solana/web3.js";

export type InitChanAmmInstructionParsed = {
  raydiumPoolAddr: PublicKey;
  type: "init_chan_amm";
};

export async function parseInitChanAmmInstruction(tx: ParsedTransactionWithMeta, index: number) {
  const ix = tx.transaction.message.instructions[index];

  if (!("accounts" in ix)) {
    return undefined;
  }

  const meteoraPoolAddr = ix.accounts[15]; /// 16th acc - ammPool

  const glParsed: InitChanAmmInstructionParsed = {
    raydiumPoolAddr: meteoraPoolAddr,
    type: "init_chan_amm",
  };

  return glParsed;
}
