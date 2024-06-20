import { NATIVE_MINT } from "@solana/spl-token";
import { Transaction, PublicKey } from "@solana/web3.js";

import { unwrapSOLInstruction } from "./unwrapSOLInstruction";

export function addUnwrapSOLInstructionIfNativeMint(
  quoteMint: PublicKey,
  payerPublicKey: PublicKey,
  transaction: Transaction,
) {
  if (quoteMint.equals(NATIVE_MINT)) {
    const unwrapInstruction = unwrapSOLInstruction(payerPublicKey);
    if (unwrapInstruction) {
      transaction.add(unwrapInstruction);
    }
  }
}
