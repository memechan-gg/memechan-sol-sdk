import { TransactionInstruction, PublicKey } from "@solana/web3.js" // eslint-disable-line @typescript-eslint/no-unused-vars
import BN from "bn.js" // eslint-disable-line @typescript-eslint/no-unused-vars
import * as borsh from "@project-serum/borsh" // eslint-disable-line @typescript-eslint/no-unused-vars
import * as types from "../types" // eslint-disable-line @typescript-eslint/no-unused-vars
import { PROGRAM_ID } from "../programId"

export interface GetSwapXAmtArgs {
  coinInAmount: BN
  coinYMinValue: BN
}

export interface GetSwapXAmtAccounts {
  pool: PublicKey
  quoteVault: PublicKey
}

export const layout = borsh.struct([
  borsh.u64("coinInAmount"),
  borsh.u64("coinYMinValue"),
])

export function getSwapXAmt(
  args: GetSwapXAmtArgs,
  accounts: GetSwapXAmtAccounts
) {
  const keys = [
    { pubkey: accounts.pool, isSigner: false, isWritable: false },
    { pubkey: accounts.quoteVault, isSigner: false, isWritable: false },
  ]
  const identifier = Buffer.from([239, 63, 83, 118, 169, 9, 82, 226])
  const buffer = Buffer.alloc(1000)
  const len = layout.encode(
    {
      coinInAmount: args.coinInAmount,
      coinYMinValue: args.coinYMinValue,
    },
    buffer
  )
  const data = Buffer.concat([identifier, buffer]).slice(0, 8 + len)
  const ix = new TransactionInstruction({ keys, programId: PROGRAM_ID, data })
  return ix
}
