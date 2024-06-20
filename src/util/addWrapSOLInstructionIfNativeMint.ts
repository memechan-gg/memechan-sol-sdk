import { NATIVE_MINT } from "@solana/spl-token";
import { Transaction, PublicKey } from "@solana/web3.js";

import BN from "bn.js";
import { wrapSOLInstruction } from "./wrapSOLInstruction";

export function addWrapSOLInstructionIfNativeMint(
  quoteMint: PublicKey,
  payerPublicKey: PublicKey,
  destinationAddress: PublicKey,
  amount: BN,
  transaction: Transaction,
): Transaction {
  if (quoteMint.equals(NATIVE_MINT)) {
    transaction.add(...wrapSOLInstruction(payerPublicKey, destinationAddress, amount));
  }
  return transaction;
}
