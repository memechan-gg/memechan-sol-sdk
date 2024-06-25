import { TransactionInstruction, PublicKey } from "@solana/web3.js";
import BN from "bn.js"; // eslint-disable-line @typescript-eslint/no-unused-vars
import * as borsh from "@project-serum/borsh"; // eslint-disable-line @typescript-eslint/no-unused-vars
import * as types from "../types"; // eslint-disable-line @typescript-eslint/no-unused-vars
import { PROGRAM_ID } from "../programId";

export interface AddFeesAccounts {
  staking: PublicKey;
  memeVault: PublicKey;
  memeMint: PublicKey;
  quoteVault: PublicKey;
  quoteMint: PublicKey;
  memeFeeVault: PublicKey;
  quoteFeeVault: PublicKey;
  stakingSignerPda: PublicKey;
  ammPool: PublicKey;
  lpMint: PublicKey;
  aTokenVault: PublicKey;
  aVault: PublicKey;
  aVaultLp: PublicKey;
  aVaultLpMint: PublicKey;
  bTokenVault: PublicKey;
  bVault: PublicKey;
  bVaultLp: PublicKey;
  bVaultLpMint: PublicKey;
  lockEscrow: PublicKey;
  escrowVault: PublicKey;
  sourceTokens: PublicKey;
  signer: PublicKey;
  tokenProgram: PublicKey;
  ammProgram: PublicKey;
  vaultProgram: PublicKey;
  memoProgram: PublicKey;
}

export function addFees(accounts: AddFeesAccounts) {
  const keys = [
    { pubkey: accounts.staking, isSigner: false, isWritable: true },
    { pubkey: accounts.memeVault, isSigner: false, isWritable: true },
    { pubkey: accounts.memeMint, isSigner: false, isWritable: false },
    { pubkey: accounts.quoteVault, isSigner: false, isWritable: true },
    { pubkey: accounts.quoteMint, isSigner: false, isWritable: false },
    { pubkey: accounts.memeFeeVault, isSigner: false, isWritable: true },
    { pubkey: accounts.quoteFeeVault, isSigner: false, isWritable: true },
    { pubkey: accounts.stakingSignerPda, isSigner: false, isWritable: true },
    { pubkey: accounts.ammPool, isSigner: false, isWritable: true },
    { pubkey: accounts.lpMint, isSigner: false, isWritable: true },
    { pubkey: accounts.aTokenVault, isSigner: false, isWritable: true },
    { pubkey: accounts.aVault, isSigner: false, isWritable: true },
    { pubkey: accounts.aVaultLp, isSigner: false, isWritable: true },
    { pubkey: accounts.aVaultLpMint, isSigner: false, isWritable: true },
    { pubkey: accounts.bTokenVault, isSigner: false, isWritable: true },
    { pubkey: accounts.bVault, isSigner: false, isWritable: true },
    { pubkey: accounts.bVaultLp, isSigner: false, isWritable: true },
    { pubkey: accounts.bVaultLpMint, isSigner: false, isWritable: true },
    { pubkey: accounts.lockEscrow, isSigner: false, isWritable: true },
    { pubkey: accounts.escrowVault, isSigner: false, isWritable: true },
    { pubkey: accounts.sourceTokens, isSigner: false, isWritable: true },
    { pubkey: accounts.signer, isSigner: true, isWritable: true },
    { pubkey: accounts.tokenProgram, isSigner: false, isWritable: false },
    { pubkey: accounts.ammProgram, isSigner: false, isWritable: false },
    { pubkey: accounts.vaultProgram, isSigner: false, isWritable: false },
    { pubkey: accounts.memoProgram, isSigner: false, isWritable: false },
  ];
  const identifier = Buffer.from([145, 48, 8, 226, 201, 146, 35, 94]);
  const data = identifier;
  const ix = new TransactionInstruction({ keys, programId: PROGRAM_ID, data });
  return ix;
}
