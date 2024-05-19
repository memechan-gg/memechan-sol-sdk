import { TransactionInstruction, PublicKey } from "@solana/web3.js" // eslint-disable-line @typescript-eslint/no-unused-vars
import BN from "bn.js" // eslint-disable-line @typescript-eslint/no-unused-vars
import * as borsh from "@project-serum/borsh" // eslint-disable-line @typescript-eslint/no-unused-vars
import * as types from "../types" // eslint-disable-line @typescript-eslint/no-unused-vars
import { PROGRAM_ID } from "../programId"

export interface NewTargetConfigArgs {
  targetAmount: BN
}

export interface NewTargetConfigAccounts {
  sender: PublicKey
  targetConfig: PublicKey
  mint: PublicKey
  systemProgram: PublicKey
}

export const layout = borsh.struct([borsh.u64("targetAmount")])

export function newTargetConfig(
  args: NewTargetConfigArgs,
  accounts: NewTargetConfigAccounts
) {
  const keys = [
    { pubkey: accounts.sender, isSigner: true, isWritable: true },
    { pubkey: accounts.targetConfig, isSigner: false, isWritable: true },
    { pubkey: accounts.mint, isSigner: false, isWritable: false },
    { pubkey: accounts.systemProgram, isSigner: false, isWritable: false },
  ]
  const identifier = Buffer.from([103, 216, 81, 69, 248, 223, 9, 191])
  const buffer = Buffer.alloc(1000)
  const len = layout.encode(
    {
      targetAmount: args.targetAmount,
    },
    buffer
  )
  const data = Buffer.concat([identifier, buffer]).slice(0, 8 + len)
  const ix = new TransactionInstruction({ keys, programId: PROGRAM_ID, data })
  return ix
}
