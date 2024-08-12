import { TransactionInstruction, PublicKey } from "@solana/web3.js"; // eslint-disable-line @typescript-eslint/no-unused-vars
import BN from "bn.js"; // eslint-disable-line @typescript-eslint/no-unused-vars
import * as borsh from "@project-serum/borsh"; // eslint-disable-line @typescript-eslint/no-unused-vars
import * as types from "../types"; // eslint-disable-line @typescript-eslint/no-unused-vars
import { PROGRAM_ID } from "../programId";

export interface NewUserStatsIdempotentAccounts {
  sender: PublicKey;
  referral: PublicKey;
  pool: PublicKey;
  userStats: PublicKey;
  systemProgram: PublicKey;
}

export function newUserStatsIdempotent(accounts: NewUserStatsIdempotentAccounts) {
  const keys = [
    { pubkey: accounts.sender, isSigner: true, isWritable: true },
    { pubkey: accounts.referral, isSigner: false, isWritable: false },
    { pubkey: accounts.pool, isSigner: false, isWritable: false },
    { pubkey: accounts.userStats, isSigner: false, isWritable: true },
    { pubkey: accounts.systemProgram, isSigner: false, isWritable: false },
  ];
  const identifier = Buffer.from([254, 186, 213, 104, 211, 137, 231, 14]);
  const data = identifier;
  const ix = new TransactionInstruction({ keys, programId: PROGRAM_ID, data });
  return ix;
}
