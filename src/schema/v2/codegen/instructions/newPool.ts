import { TransactionInstruction, PublicKey } from "@solana/web3.js";
import BN from "bn.js"; // eslint-disable-line @typescript-eslint/no-unused-vars
import * as borsh from "@project-serum/borsh"; // eslint-disable-line @typescript-eslint/no-unused-vars
import * as types from "../types"; // eslint-disable-line @typescript-eslint/no-unused-vars
import { PROGRAM_ID } from "../programId";

export interface NewPoolAccounts {
  sender: PublicKey;
  pool: PublicKey;
  memeMint: PublicKey;
  quoteVault: PublicKey;
  quoteMint: PublicKey;
  feeQuoteVault: PublicKey;
  memeVault: PublicKey;
  targetConfig: PublicKey;
  poolSigner: PublicKey;
  systemProgram: PublicKey;
  tokenProgram: PublicKey;
}

export function newPool(accounts: NewPoolAccounts) {
  const keys = [
    { pubkey: accounts.sender, isSigner: true, isWritable: true },
    { pubkey: accounts.pool, isSigner: false, isWritable: true },
    { pubkey: accounts.memeMint, isSigner: false, isWritable: true },
    { pubkey: accounts.quoteVault, isSigner: false, isWritable: false },
    { pubkey: accounts.quoteMint, isSigner: false, isWritable: false },
    { pubkey: accounts.feeQuoteVault, isSigner: false, isWritable: false },
    { pubkey: accounts.memeVault, isSigner: false, isWritable: true },
    { pubkey: accounts.targetConfig, isSigner: false, isWritable: false },
    { pubkey: accounts.poolSigner, isSigner: false, isWritable: false },
    { pubkey: accounts.systemProgram, isSigner: false, isWritable: false },
    { pubkey: accounts.tokenProgram, isSigner: false, isWritable: false },
  ];
  const identifier = Buffer.from([38, 63, 210, 32, 246, 20, 239, 112]);
  const data = identifier;
  const ix = new TransactionInstruction({ keys, programId: PROGRAM_ID, data });
  return ix;
}
