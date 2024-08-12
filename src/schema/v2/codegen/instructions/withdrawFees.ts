import { TransactionInstruction, PublicKey } from "@solana/web3.js"; // eslint-disable-line @typescript-eslint/no-unused-vars
import BN from "bn.js"; // eslint-disable-line @typescript-eslint/no-unused-vars
import * as borsh from "@project-serum/borsh"; // eslint-disable-line @typescript-eslint/no-unused-vars
import * as types from "../types"; // eslint-disable-line @typescript-eslint/no-unused-vars
import { PROGRAM_ID } from "../programId";

export interface WithdrawFeesAccounts {
  owner: PublicKey;
  staking: PublicKey;
  memeTicket: PublicKey;
  userStats: PublicKey;
  userMeme: PublicKey;
  userQuote: PublicKey;
  userChan: PublicKey;
  memeVault: PublicKey;
  quoteVault: PublicKey;
  chanVault: PublicKey;
  beMeme: PublicKey;
  stakingSignerPda: PublicKey;
  tokenProgram: PublicKey;
}

export function withdrawFees(accounts: WithdrawFeesAccounts) {
  const keys = [
    { pubkey: accounts.owner, isSigner: false, isWritable: false },
    { pubkey: accounts.staking, isSigner: false, isWritable: false },
    { pubkey: accounts.memeTicket, isSigner: false, isWritable: true },
    { pubkey: accounts.userStats, isSigner: false, isWritable: true },
    { pubkey: accounts.userMeme, isSigner: false, isWritable: true },
    { pubkey: accounts.userQuote, isSigner: false, isWritable: true },
    { pubkey: accounts.userChan, isSigner: false, isWritable: true },
    { pubkey: accounts.memeVault, isSigner: false, isWritable: true },
    { pubkey: accounts.quoteVault, isSigner: false, isWritable: true },
    { pubkey: accounts.chanVault, isSigner: false, isWritable: true },
    { pubkey: accounts.beMeme, isSigner: false, isWritable: true },
    { pubkey: accounts.stakingSignerPda, isSigner: false, isWritable: false },
    { pubkey: accounts.tokenProgram, isSigner: false, isWritable: false },
  ];
  const identifier = Buffer.from([198, 212, 171, 109, 144, 215, 174, 89]);
  const data = identifier;
  const ix = new TransactionInstruction({ keys, programId: PROGRAM_ID, data });
  return ix;
}
