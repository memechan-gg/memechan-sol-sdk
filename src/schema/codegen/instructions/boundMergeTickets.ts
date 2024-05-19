import { TransactionInstruction, PublicKey } from "@solana/web3.js" // eslint-disable-line @typescript-eslint/no-unused-vars
import BN from "bn.js" // eslint-disable-line @typescript-eslint/no-unused-vars
import * as borsh from "@project-serum/borsh" // eslint-disable-line @typescript-eslint/no-unused-vars
import * as types from "../types" // eslint-disable-line @typescript-eslint/no-unused-vars
import { PROGRAM_ID } from "../programId"

export interface BoundMergeTicketsAccounts {
  pool: PublicKey
  ticketInto: PublicKey
  ticketFrom: PublicKey
  owner: PublicKey
}

export function boundMergeTickets(accounts: BoundMergeTicketsAccounts) {
  const keys = [
    { pubkey: accounts.pool, isSigner: false, isWritable: false },
    { pubkey: accounts.ticketInto, isSigner: false, isWritable: true },
    { pubkey: accounts.ticketFrom, isSigner: false, isWritable: true },
    { pubkey: accounts.owner, isSigner: true, isWritable: true },
  ]
  const identifier = Buffer.from([137, 93, 100, 122, 59, 95, 29, 236])
  const data = identifier
  const ix = new TransactionInstruction({ keys, programId: PROGRAM_ID, data })
  return ix
}
