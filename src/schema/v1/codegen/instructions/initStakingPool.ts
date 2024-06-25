import { TransactionInstruction, PublicKey } from "@solana/web3.js"; // eslint-disable-line @typescript-eslint/no-unused-vars
import BN from "bn.js"; // eslint-disable-line @typescript-eslint/no-unused-vars
import * as borsh from "@project-serum/borsh"; // eslint-disable-line @typescript-eslint/no-unused-vars
import * as types from "../types"; // eslint-disable-line @typescript-eslint/no-unused-vars
import { PROGRAM_ID } from "../programId";

export interface InitStakingPoolAccounts {
  signer: PublicKey;
  pool: PublicKey;
  boundPoolSignerPda: PublicKey;
  poolMemeVault: PublicKey;
  poolQuoteVault: PublicKey;
  feeVaultQuote: PublicKey;
  memeMint: PublicKey;
  quoteMint: PublicKey;
  staking: PublicKey;
  stakingPoolSignerPda: PublicKey;
  stakingMemeVault: PublicKey;
  stakingQuoteVault: PublicKey;
  memeTicket: PublicKey;
  rent: PublicKey;
  clock: PublicKey;
  ataProgram: PublicKey;
  marketProgramId: PublicKey;
  tokenProgram: PublicKey;
  systemProgram: PublicKey;
}

export function initStakingPool(accounts: InitStakingPoolAccounts) {
  const keys = [
    { pubkey: accounts.signer, isSigner: true, isWritable: true },
    { pubkey: accounts.pool, isSigner: false, isWritable: true },
    { pubkey: accounts.boundPoolSignerPda, isSigner: false, isWritable: false },
    { pubkey: accounts.poolMemeVault, isSigner: false, isWritable: true },
    { pubkey: accounts.poolQuoteVault, isSigner: false, isWritable: true },
    { pubkey: accounts.feeVaultQuote, isSigner: false, isWritable: true },
    { pubkey: accounts.memeMint, isSigner: false, isWritable: false },
    { pubkey: accounts.quoteMint, isSigner: false, isWritable: false },
    { pubkey: accounts.staking, isSigner: false, isWritable: true },
    {
      pubkey: accounts.stakingPoolSignerPda,
      isSigner: false,
      isWritable: true,
    },
    { pubkey: accounts.stakingMemeVault, isSigner: false, isWritable: true },
    { pubkey: accounts.stakingQuoteVault, isSigner: false, isWritable: true },
    { pubkey: accounts.memeTicket, isSigner: false, isWritable: true },
    { pubkey: accounts.rent, isSigner: false, isWritable: false },
    { pubkey: accounts.clock, isSigner: false, isWritable: false },
    { pubkey: accounts.ataProgram, isSigner: false, isWritable: false },
    { pubkey: accounts.marketProgramId, isSigner: false, isWritable: false },
    { pubkey: accounts.tokenProgram, isSigner: false, isWritable: false },
    { pubkey: accounts.systemProgram, isSigner: false, isWritable: false },
  ];
  const identifier = Buffer.from([104, 193, 216, 189, 77, 85, 90, 51]);
  const data = identifier;
  const ix = new TransactionInstruction({ keys, programId: PROGRAM_ID, data });
  return ix;
}
