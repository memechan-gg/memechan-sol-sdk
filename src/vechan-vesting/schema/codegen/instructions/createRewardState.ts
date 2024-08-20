import { TransactionInstruction, PublicKey } from "@solana/web3.js"; // eslint-disable-line @typescript-eslint/no-unused-vars
import BN from "bn.js"; // eslint-disable-line @typescript-eslint/no-unused-vars
import * as borsh from "@project-serum/borsh"; // eslint-disable-line @typescript-eslint/no-unused-vars
import { PROGRAM_ID } from "../programId";

export interface CreateRewardStateAccounts {
  signer: PublicKey;
  rewardState: PublicKey;
  stakingState: PublicKey;
  mint: PublicKey;
  systemProgram: PublicKey;
}

export function createRewardState(accounts: CreateRewardStateAccounts) {
  const keys = [
    { pubkey: accounts.signer, isSigner: true, isWritable: true },
    { pubkey: accounts.rewardState, isSigner: false, isWritable: true },
    { pubkey: accounts.stakingState, isSigner: false, isWritable: false },
    { pubkey: accounts.mint, isSigner: false, isWritable: false },
    { pubkey: accounts.systemProgram, isSigner: false, isWritable: false },
  ];
  const identifier = Buffer.from([126, 174, 245, 233, 230, 50, 223, 146]);
  const data = identifier;
  const ix = new TransactionInstruction({ keys, programId: PROGRAM_ID, data });
  return ix;
}
