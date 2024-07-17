import { ParsedTransactionWithMeta, PublicKey } from "@solana/web3.js";

export type InitQuoteAmmInstructionParsed = {
  raydiumPoolAddr: PublicKey;
  type: "init_quote_amm";
};

export async function parseInitQuoteAmmInstruction(tx: ParsedTransactionWithMeta, index: number) {
  const ix = tx.transaction.message.instructions[index];

  if (!("accounts" in ix)) {
    return undefined;
  }

  const meteoraPoolAddr = ix.accounts[10]; // 11th acc - ammPool

  const glParsed: InitQuoteAmmInstructionParsed = {
    raydiumPoolAddr: meteoraPoolAddr,
    type: "init_quote_amm",
  };

  return glParsed;
}
