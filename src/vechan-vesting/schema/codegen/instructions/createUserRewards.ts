import { TransactionInstruction, PublicKey } from "@solana/web3.js"; // eslint-disable-line @typescript-eslint/no-unused-vars
import BN from "bn.js"; // eslint-disable-line @typescript-eslint/no-unused-vars
import * as borsh from "@project-serum/borsh"; // eslint-disable-line @typescript-eslint/no-unused-vars
import { PROGRAM_ID } from "../programId";

export interface CreateUserRewardsAccounts {
  signer: PublicKey;
  userRewards: PublicKey;
  stake: PublicKey;
  rewardState: PublicKey;
  mint: PublicKey;
  systemProgram: PublicKey;
}

export function createUserRewards(accounts: CreateUserRewardsAccounts) {
  const keys = [
    { pubkey: accounts.signer, isSigner: true, isWritable: true },
    { pubkey: accounts.userRewards, isSigner: false, isWritable: true },
    { pubkey: accounts.stake, isSigner: false, isWritable: false },
    { pubkey: accounts.rewardState, isSigner: false, isWritable: false },
    { pubkey: accounts.mint, isSigner: false, isWritable: false },
    { pubkey: accounts.systemProgram, isSigner: false, isWritable: false },
  ];
  const identifier = Buffer.from([37, 94, 120, 170, 197, 77, 44, 244]);
  const data = identifier;
  const ix = new TransactionInstruction({ keys, programId: PROGRAM_ID, data });
  return ix;
}
