import { PublicKey } from "@solana/web3.js";

export type VestingInfo = {
  cliffStarts: number;
  vestingStarts: number;
  vestingEnds: number;
};

export type UserVesting =
  | {
      isEligible: false;
    }
  | { isEligible: true; vestedAmount: string; claimableAmount: string };

export type GetUserVestingArgs = {
  user: PublicKey;
};
