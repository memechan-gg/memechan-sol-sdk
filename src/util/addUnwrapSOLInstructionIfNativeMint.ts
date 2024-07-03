import { Transaction, PublicKey } from "@solana/web3.js";

import { unwrapSOLInstruction } from "./unwrapSOLInstruction";

export async function addUnwrapSOLInstructionIfNativeMint(
  quoteMint: PublicKey,
  payerPublicKey: PublicKey,
  transaction: Transaction,
) {
  const { NATIVE_MINT } = await import("@solana/spl-token");
  if (quoteMint.equals(NATIVE_MINT)) {
    const unwrapInstruction = await unwrapSOLInstruction(payerPublicKey);
    if (unwrapInstruction) {
      transaction.add(unwrapInstruction);
    }
  }
}
