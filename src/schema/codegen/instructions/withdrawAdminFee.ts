import { TransactionInstruction, PublicKey } from "@solana/web3.js"; // eslint-disable-line @typescript-eslint/no-unused-vars
import BN from "bn.js"; // eslint-disable-line @typescript-eslint/no-unused-vars
import * as borsh from "@project-serum/borsh"; // eslint-disable-line @typescript-eslint/no-unused-vars
import * as types from "../types"; // eslint-disable-line @typescript-eslint/no-unused-vars
import { PROGRAM_ID } from "../programId";

export interface WithdrawAdminFeeAccounts {
  sender: PublicKey;
  pool: PublicKey;
  boundPoolSignerPda: PublicKey;
  poolQuoteVault: PublicKey;
  feeVaultQuote: PublicKey;
  tokenProgram: PublicKey;
}

export function withdrawAdminFee(accounts: WithdrawAdminFeeAccounts) {
  const keys = [
    { pubkey: accounts.sender, isSigner: true, isWritable: true },
    { pubkey: accounts.pool, isSigner: false, isWritable: true },
    { pubkey: accounts.boundPoolSignerPda, isSigner: false, isWritable: false },
    { pubkey: accounts.poolQuoteVault, isSigner: false, isWritable: true },
    { pubkey: accounts.feeVaultQuote, isSigner: false, isWritable: true },
    { pubkey: accounts.tokenProgram, isSigner: false, isWritable: false },
  ];
  const identifier = Buffer.from([176, 135, 230, 197, 163, 130, 60, 252]);
  const data = identifier;
  const ix = new TransactionInstruction({ keys, programId: PROGRAM_ID, data });
  return ix;
}
