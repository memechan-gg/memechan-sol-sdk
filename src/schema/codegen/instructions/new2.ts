import { TransactionInstruction, PublicKey } from "@solana/web3.js" // eslint-disable-line @typescript-eslint/no-unused-vars
import BN from "bn.js" // eslint-disable-line @typescript-eslint/no-unused-vars
import * as borsh from "@project-serum/borsh" // eslint-disable-line @typescript-eslint/no-unused-vars
import * as types from "../types" // eslint-disable-line @typescript-eslint/no-unused-vars
import { PROGRAM_ID } from "../programId"

export interface New2Accounts {
  sender: PublicKey
  pool: PublicKey
  memeMint: PublicKey
  quoteVault: PublicKey
  quoteMint: PublicKey
  adminQuoteVault: PublicKey
  memeVault: PublicKey
  poolSigner: PublicKey
  systemProgram: PublicKey
  tokenProgram: PublicKey
}

export function new2(accounts: New2Accounts) {
  const keys = [
    { pubkey: accounts.sender, isSigner: true, isWritable: true },
    { pubkey: accounts.pool, isSigner: false, isWritable: true },
    { pubkey: accounts.memeMint, isSigner: false, isWritable: true },
    { pubkey: accounts.quoteVault, isSigner: false, isWritable: false },
    { pubkey: accounts.quoteMint, isSigner: false, isWritable: false },
    { pubkey: accounts.adminQuoteVault, isSigner: false, isWritable: false },
    { pubkey: accounts.memeVault, isSigner: false, isWritable: true },
    { pubkey: accounts.poolSigner, isSigner: false, isWritable: false },
    { pubkey: accounts.systemProgram, isSigner: false, isWritable: false },
    { pubkey: accounts.tokenProgram, isSigner: false, isWritable: false },
  ]
  const identifier = Buffer.from([67, 186, 227, 31, 219, 8, 26, 80])
  const data = identifier
  const ix = new TransactionInstruction({ keys, programId: PROGRAM_ID, data })
  return ix
}
