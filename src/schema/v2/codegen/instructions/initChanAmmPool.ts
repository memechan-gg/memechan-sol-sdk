import { TransactionInstruction, PublicKey } from "@solana/web3.js";
import BN from "bn.js"; // eslint-disable-line @typescript-eslint/no-unused-vars
import * as borsh from "@project-serum/borsh"; // eslint-disable-line @typescript-eslint/no-unused-vars
import * as types from "../types"; // eslint-disable-line @typescript-eslint/no-unused-vars
import { PROGRAM_ID } from "../programId";

export interface InitChanAmmPoolAccounts {
  signer: PublicKey;
  staking: PublicKey;
  stakingPoolSignerPda: PublicKey;
  stakingQuoteVault: PublicKey;
  stakingMemeVault: PublicKey;
  stakingChanVault: PublicKey;
  memeMint: PublicKey;
  chanMint: PublicKey;
  chanSwap: PublicKey;
  chanSwapSignerPda: PublicKey;
  chanSwapVault: PublicKey;
  feeQuoteVault: PublicKey;
  lpMint: PublicKey;
  feeOwner: PublicKey;
  payerPoolLp: PublicKey;
  ammPool: PublicKey;
  mintMetadata: PublicKey;
  aTokenVault: PublicKey;
  aVault: PublicKey;
  aVaultLp: PublicKey;
  aVaultLpMint: PublicKey;
  bTokenVault: PublicKey;
  bVault: PublicKey;
  bVaultLp: PublicKey;
  bVaultLpMint: PublicKey;
  adminTokenAFee: PublicKey;
  adminTokenBFee: PublicKey;
  lockEscrow: PublicKey;
  escrowVault: PublicKey;
  rent: PublicKey;
  metadataProgram: PublicKey;
  ataProgram: PublicKey;
  ammProgram: PublicKey;
  vaultProgram: PublicKey;
  tokenProgram: PublicKey;
  systemProgram: PublicKey;
}

export function initChanAmmPool(accounts: InitChanAmmPoolAccounts) {
  const keys = [
    { pubkey: accounts.signer, isSigner: true, isWritable: true },
    { pubkey: accounts.staking, isSigner: false, isWritable: true },
    {
      pubkey: accounts.stakingPoolSignerPda,
      isSigner: false,
      isWritable: true,
    },
    { pubkey: accounts.stakingQuoteVault, isSigner: false, isWritable: true },
    { pubkey: accounts.stakingMemeVault, isSigner: false, isWritable: true },
    { pubkey: accounts.stakingChanVault, isSigner: false, isWritable: true },
    { pubkey: accounts.memeMint, isSigner: false, isWritable: false },
    { pubkey: accounts.chanMint, isSigner: false, isWritable: false },
    { pubkey: accounts.chanSwap, isSigner: false, isWritable: false },
    { pubkey: accounts.chanSwapSignerPda, isSigner: false, isWritable: true },
    { pubkey: accounts.chanSwapVault, isSigner: false, isWritable: true },
    { pubkey: accounts.feeQuoteVault, isSigner: false, isWritable: true },
    { pubkey: accounts.lpMint, isSigner: false, isWritable: true },
    { pubkey: accounts.feeOwner, isSigner: false, isWritable: false },
    { pubkey: accounts.payerPoolLp, isSigner: false, isWritable: true },
    { pubkey: accounts.ammPool, isSigner: false, isWritable: true },
    { pubkey: accounts.mintMetadata, isSigner: false, isWritable: true },
    { pubkey: accounts.aTokenVault, isSigner: false, isWritable: true },
    { pubkey: accounts.aVault, isSigner: false, isWritable: true },
    { pubkey: accounts.aVaultLp, isSigner: false, isWritable: true },
    { pubkey: accounts.aVaultLpMint, isSigner: false, isWritable: true },
    { pubkey: accounts.bTokenVault, isSigner: false, isWritable: true },
    { pubkey: accounts.bVault, isSigner: false, isWritable: true },
    { pubkey: accounts.bVaultLp, isSigner: false, isWritable: true },
    { pubkey: accounts.bVaultLpMint, isSigner: false, isWritable: true },
    { pubkey: accounts.adminTokenAFee, isSigner: false, isWritable: true },
    { pubkey: accounts.adminTokenBFee, isSigner: false, isWritable: true },
    { pubkey: accounts.lockEscrow, isSigner: false, isWritable: true },
    { pubkey: accounts.escrowVault, isSigner: false, isWritable: true },
    { pubkey: accounts.rent, isSigner: false, isWritable: false },
    { pubkey: accounts.metadataProgram, isSigner: false, isWritable: false },
    { pubkey: accounts.ataProgram, isSigner: false, isWritable: false },
    { pubkey: accounts.ammProgram, isSigner: false, isWritable: false },
    { pubkey: accounts.vaultProgram, isSigner: false, isWritable: false },
    { pubkey: accounts.tokenProgram, isSigner: false, isWritable: false },
    { pubkey: accounts.systemProgram, isSigner: false, isWritable: false },
  ];
  const identifier = Buffer.from([129, 8, 218, 246, 64, 236, 242, 22]);
  const data = identifier;
  const ix = new TransactionInstruction({ keys, programId: PROGRAM_ID, data });
  return ix;
}