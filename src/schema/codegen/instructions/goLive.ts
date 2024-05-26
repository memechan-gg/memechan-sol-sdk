import { TransactionInstruction, PublicKey } from "@solana/web3.js"; // eslint-disable-line @typescript-eslint/no-unused-vars
import BN from "bn.js"; // eslint-disable-line @typescript-eslint/no-unused-vars
import * as borsh from "@project-serum/borsh"; // eslint-disable-line @typescript-eslint/no-unused-vars
import * as types from "../types"; // eslint-disable-line @typescript-eslint/no-unused-vars
import { PROGRAM_ID } from "../programId";

export interface GoLiveArgs {
  nonce: number;
}

export interface GoLiveAccounts {
  signer: PublicKey;
  staking: PublicKey;
  stakingPoolSignerPda: PublicKey;
  poolMemeVault: PublicKey;
  poolQuoteVault: PublicKey;
  memeMint: PublicKey;
  quoteMint: PublicKey;
  openOrders: PublicKey;
  targetOrders: PublicKey;
  marketAccount: PublicKey;
  raydiumAmm: PublicKey;
  raydiumAmmAuthority: PublicKey;
  raydiumLpMint: PublicKey;
  raydiumMemeVault: PublicKey;
  raydiumQuoteVault: PublicKey;
  ammConfig: PublicKey;
  feeDestinationInfo: PublicKey;
  userDestinationLpTokenAta: PublicKey;
  rent: PublicKey;
  clock: PublicKey;
  raydiumProgram: PublicKey;
  ataProgram: PublicKey;
  marketProgramId: PublicKey;
  tokenProgram: PublicKey;
  systemProgram: PublicKey;
}

export const layout = borsh.struct([borsh.u8("nonce")]);

export function goLive(args: GoLiveArgs, accounts: GoLiveAccounts) {
  const keys = [
    { pubkey: accounts.signer, isSigner: true, isWritable: true },
    { pubkey: accounts.staking, isSigner: false, isWritable: true },
    {
      pubkey: accounts.stakingPoolSignerPda,
      isSigner: false,
      isWritable: true,
    },
    { pubkey: accounts.poolMemeVault, isSigner: false, isWritable: true },
    { pubkey: accounts.poolQuoteVault, isSigner: false, isWritable: true },
    { pubkey: accounts.memeMint, isSigner: false, isWritable: false },
    { pubkey: accounts.quoteMint, isSigner: false, isWritable: false },
    { pubkey: accounts.openOrders, isSigner: false, isWritable: true },
    { pubkey: accounts.targetOrders, isSigner: false, isWritable: true },
    { pubkey: accounts.marketAccount, isSigner: false, isWritable: true },
    { pubkey: accounts.raydiumAmm, isSigner: false, isWritable: true },
    { pubkey: accounts.raydiumAmmAuthority, isSigner: false, isWritable: true },
    { pubkey: accounts.raydiumLpMint, isSigner: false, isWritable: true },
    { pubkey: accounts.raydiumMemeVault, isSigner: false, isWritable: true },
    { pubkey: accounts.raydiumQuoteVault, isSigner: false, isWritable: true },
    { pubkey: accounts.ammConfig, isSigner: false, isWritable: false },
    { pubkey: accounts.feeDestinationInfo, isSigner: false, isWritable: true },
    {
      pubkey: accounts.userDestinationLpTokenAta,
      isSigner: false,
      isWritable: true,
    },
    { pubkey: accounts.rent, isSigner: false, isWritable: false },
    { pubkey: accounts.clock, isSigner: false, isWritable: false },
    { pubkey: accounts.raydiumProgram, isSigner: false, isWritable: false },
    { pubkey: accounts.ataProgram, isSigner: false, isWritable: false },
    { pubkey: accounts.marketProgramId, isSigner: false, isWritable: false },
    { pubkey: accounts.tokenProgram, isSigner: false, isWritable: false },
    { pubkey: accounts.systemProgram, isSigner: false, isWritable: false },
  ];
  const identifier = Buffer.from([126, 98, 10, 43, 92, 184, 85, 248]);
  const buffer = Buffer.alloc(1000);
  const len = layout.encode(
    {
      nonce: args.nonce,
    },
    buffer,
  );
  const data = Buffer.concat([identifier, buffer]).slice(0, 8 + len);
  const ix = new TransactionInstruction({ keys, programId: PROGRAM_ID, data });
  return ix;
}
