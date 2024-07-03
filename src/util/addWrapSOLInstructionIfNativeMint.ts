import { Transaction, PublicKey } from "@solana/web3.js";

import BN from "bn.js";
import { wrapSOLInstruction } from "./wrapSOLInstruction";

export async function addWrapSOLInstructionIfNativeMint(
  quoteMint: PublicKey,
  payerPublicKey: PublicKey,
  destinationAddress: PublicKey,
  amount: BN,
  transaction: Transaction,
): Promise<Transaction> {
  const { NATIVE_MINT } = await import("@solana/spl-token");
  if (quoteMint.equals(NATIVE_MINT)) {
    transaction.add(...wrapSOLInstruction(payerPublicKey, destinationAddress, amount));
  }
  return transaction;
}
