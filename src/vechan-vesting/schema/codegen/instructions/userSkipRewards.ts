import { TransactionInstruction, PublicKey } from "@solana/web3.js"; // eslint-disable-line @typescript-eslint/no-unused-vars
import BN from "bn.js"; // eslint-disable-line @typescript-eslint/no-unused-vars
import * as borsh from "@project-serum/borsh"; // eslint-disable-line @typescript-eslint/no-unused-vars
import { PROGRAM_ID } from "../programId";

export interface UserSkipRewardsArgs {
  rewardNumberPrev: BN;
  rewardNumberNext: BN;
}

export interface UserSkipRewardsAccounts {
  userRewards: PublicKey;
  stake: PublicKey;
  rewardPrev: PublicKey;
  rewardNext: PublicKey;
  rewardState: PublicKey;
  systemProgram: PublicKey;
}

export const layout = borsh.struct([borsh.u64("rewardNumberPrev"), borsh.u64("rewardNumberNext")]);

export function userSkipRewards(args: UserSkipRewardsArgs, accounts: UserSkipRewardsAccounts) {
  const keys = [
    { pubkey: accounts.userRewards, isSigner: false, isWritable: true },
    { pubkey: accounts.stake, isSigner: false, isWritable: false },
    { pubkey: accounts.rewardPrev, isSigner: false, isWritable: false },
    { pubkey: accounts.rewardNext, isSigner: false, isWritable: false },
    { pubkey: accounts.rewardState, isSigner: false, isWritable: false },
    { pubkey: accounts.systemProgram, isSigner: false, isWritable: false },
  ];
  const identifier = Buffer.from([235, 70, 4, 113, 184, 27, 178, 128]);
  const buffer = Buffer.alloc(1000);
  const len = layout.encode(
    {
      rewardNumberPrev: args.rewardNumberPrev,
      rewardNumberNext: args.rewardNumberNext,
    },
    buffer,
  );
  const data = Buffer.concat([identifier, buffer]).slice(0, 8 + len);
  const ix = new TransactionInstruction({ keys, programId: PROGRAM_ID, data });
  return ix;
}
