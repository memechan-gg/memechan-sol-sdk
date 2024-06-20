import { wrapSOLInstruction } from "@mercurial-finance/vault-sdk/dist/cjs/src/vault/utils";
import { NATIVE_MINT } from "@solana/spl-token";
import { Transaction, PublicKey } from "@solana/web3.js";

import BN from "bn.js";

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
