import { TransactionInstruction, PublicKey } from "@solana/web3.js"; // eslint-disable-line @typescript-eslint/no-unused-vars
import BN from "bn.js"; // eslint-disable-line @typescript-eslint/no-unused-vars
import * as borsh from "@project-serum/borsh"; // eslint-disable-line @typescript-eslint/no-unused-vars
import { PROGRAM_ID } from "../programId";

export interface CreateRewardArgs {
  rewardNumber: BN;
}

export interface CreateRewardAccounts {
  signer: PublicKey;
  reward: PublicKey;
  rewardSigner: PublicKey;
  rewardState: PublicKey;
  stakingState: PublicKey;
  vault: PublicKey;
  mint: PublicKey;
  systemProgram: PublicKey;
}

export const layout = borsh.struct([borsh.u64("rewardNumber")]);

export function createReward(args: CreateRewardArgs, accounts: CreateRewardAccounts) {
  const keys = [
    { pubkey: accounts.signer, isSigner: true, isWritable: true },
    { pubkey: accounts.reward, isSigner: false, isWritable: true },
    { pubkey: accounts.rewardSigner, isSigner: false, isWritable: false },
    { pubkey: accounts.rewardState, isSigner: false, isWritable: true },
    { pubkey: accounts.stakingState, isSigner: false, isWritable: false },
    { pubkey: accounts.vault, isSigner: false, isWritable: true },
    { pubkey: accounts.mint, isSigner: false, isWritable: false },
    { pubkey: accounts.systemProgram, isSigner: false, isWritable: false },
  ];
  const identifier = Buffer.from([55, 169, 173, 212, 11, 55, 47, 130]);
  const buffer = Buffer.alloc(1000);
  const len = layout.encode(
    {
      rewardNumber: args.rewardNumber,
    },
    buffer,
  );
  const data = Buffer.concat([identifier, buffer]).slice(0, 8 + len);
  const ix = new TransactionInstruction({ keys, programId: PROGRAM_ID, data });
  return ix;
}
