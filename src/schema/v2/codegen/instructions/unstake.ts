import { TransactionInstruction, PublicKey } from "@solana/web3.js"; // eslint-disable-line @typescript-eslint/no-unused-vars
import BN from "bn.js"; // eslint-disable-line @typescript-eslint/no-unused-vars
import * as borsh from "@project-serum/borsh"; // eslint-disable-line @typescript-eslint/no-unused-vars
import * as types from "../types"; // eslint-disable-line @typescript-eslint/no-unused-vars
import { PROGRAM_ID } from "../programId";

export interface UnstakeArgs {
  releaseAmount: BN;
}

export interface UnstakeAccounts {
  staking: PublicKey;
  memeTicket: PublicKey;
  userMeme: PublicKey;
  userQuote: PublicKey;
  userChan: PublicKey;
  memeVault: PublicKey;
  quoteVault: PublicKey;
  chanVault: PublicKey;
  signer: PublicKey;
  stakingSignerPda: PublicKey;
  tokenProgram: PublicKey;
}

export const layout = borsh.struct([borsh.u64("releaseAmount")]);

export function unstake(args: UnstakeArgs, accounts: UnstakeAccounts) {
  const keys = [
    { pubkey: accounts.staking, isSigner: false, isWritable: true },
    { pubkey: accounts.memeTicket, isSigner: false, isWritable: true },
    { pubkey: accounts.userMeme, isSigner: false, isWritable: true },
    { pubkey: accounts.userQuote, isSigner: false, isWritable: true },
    { pubkey: accounts.userChan, isSigner: false, isWritable: true },
    { pubkey: accounts.memeVault, isSigner: false, isWritable: true },
    { pubkey: accounts.quoteVault, isSigner: false, isWritable: true },
    { pubkey: accounts.chanVault, isSigner: false, isWritable: true },
    { pubkey: accounts.signer, isSigner: true, isWritable: false },
    { pubkey: accounts.stakingSignerPda, isSigner: false, isWritable: false },
    { pubkey: accounts.tokenProgram, isSigner: false, isWritable: false },
  ];
  const identifier = Buffer.from([90, 95, 107, 42, 205, 124, 50, 225]);
  const buffer = Buffer.alloc(1000);
  const len = layout.encode(
    {
      releaseAmount: args.releaseAmount,
    },
    buffer,
  );
  const data = Buffer.concat([identifier, buffer]).slice(0, 8 + len);
  const ix = new TransactionInstruction({ keys, programId: PROGRAM_ID, data });
  return ix;
}
