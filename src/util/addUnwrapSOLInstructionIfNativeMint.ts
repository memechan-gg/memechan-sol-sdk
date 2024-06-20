import { NATIVE_MINT } from "@solana/spl-token";
import { Transaction, PublicKey } from "@solana/web3.js";

import { unwrapSOLInstruction } from "./unwrapSOLInstruction";

export async function addUnwrapSOLInstructionIfNativeMint(
  quoteMint: PublicKey,
  payerPublicKey: PublicKey,
  transaction: Transaction,
): Promise<Transaction> {
  if (quoteMint.equals(NATIVE_MINT)) {
    const unwrapInstruction = await unwrapSOLInstruction(payerPublicKey);
    if (unwrapInstruction) {
      transaction.add(unwrapInstruction);
    }
  }
  return transaction;
}
