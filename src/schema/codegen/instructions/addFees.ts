import { TransactionInstruction, PublicKey } from "@solana/web3.js" // eslint-disable-line @typescript-eslint/no-unused-vars
import BN from "bn.js" // eslint-disable-line @typescript-eslint/no-unused-vars
import * as borsh from "@project-serum/borsh" // eslint-disable-line @typescript-eslint/no-unused-vars
import * as types from "../types" // eslint-disable-line @typescript-eslint/no-unused-vars
import { PROGRAM_ID } from "../programId"

export interface AddFeesAccounts {
  staking: PublicKey
  memeVault: PublicKey
  quoteVault: PublicKey
  stakingSignerPda: PublicKey
  stakingLpWallet: PublicKey
  signer: PublicKey
  raydiumAmm: PublicKey
  raydiumAmmAuthority: PublicKey
  raydiumMemeVault: PublicKey
  raydiumQuoteVault: PublicKey
  raydiumLpMint: PublicKey
  openOrders: PublicKey
  targetOrders: PublicKey
  marketAccount: PublicKey
  marketEventQueue: PublicKey
  marketCoinVault: PublicKey
  marketPcVault: PublicKey
  marketVaultSigner: PublicKey
  marketBids: PublicKey
  marketAsks: PublicKey
  tokenProgram: PublicKey
  raydiumProgram: PublicKey
  marketProgramId: PublicKey
}

export function addFees(accounts: AddFeesAccounts) {
  const keys = [
    { pubkey: accounts.staking, isSigner: false, isWritable: true },
    { pubkey: accounts.memeVault, isSigner: false, isWritable: true },
    { pubkey: accounts.quoteVault, isSigner: false, isWritable: true },
    { pubkey: accounts.stakingSignerPda, isSigner: false, isWritable: false },
    { pubkey: accounts.stakingLpWallet, isSigner: false, isWritable: true },
    { pubkey: accounts.signer, isSigner: true, isWritable: true },
    { pubkey: accounts.raydiumAmm, isSigner: false, isWritable: true },
    {
      pubkey: accounts.raydiumAmmAuthority,
      isSigner: false,
      isWritable: false,
    },
    { pubkey: accounts.raydiumMemeVault, isSigner: false, isWritable: true },
    { pubkey: accounts.raydiumQuoteVault, isSigner: false, isWritable: true },
    { pubkey: accounts.raydiumLpMint, isSigner: false, isWritable: true },
    { pubkey: accounts.openOrders, isSigner: false, isWritable: true },
    { pubkey: accounts.targetOrders, isSigner: false, isWritable: true },
    { pubkey: accounts.marketAccount, isSigner: false, isWritable: true },
    { pubkey: accounts.marketEventQueue, isSigner: false, isWritable: true },
    { pubkey: accounts.marketCoinVault, isSigner: false, isWritable: true },
    { pubkey: accounts.marketPcVault, isSigner: false, isWritable: true },
    { pubkey: accounts.marketVaultSigner, isSigner: false, isWritable: false },
    { pubkey: accounts.marketBids, isSigner: false, isWritable: true },
    { pubkey: accounts.marketAsks, isSigner: false, isWritable: true },
    { pubkey: accounts.tokenProgram, isSigner: false, isWritable: false },
    { pubkey: accounts.raydiumProgram, isSigner: false, isWritable: false },
    { pubkey: accounts.marketProgramId, isSigner: false, isWritable: false },
  ]
  const identifier = Buffer.from([145, 48, 8, 226, 201, 146, 35, 94])
  const data = identifier
  const ix = new TransactionInstruction({ keys, programId: PROGRAM_ID, data })
  return ix
}
