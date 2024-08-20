import { TransactionInstruction, PublicKey } from "@solana/web3.js"; // eslint-disable-line @typescript-eslint/no-unused-vars
import BN from "bn.js"; // eslint-disable-line @typescript-eslint/no-unused-vars
import * as borsh from "@project-serum/borsh"; // eslint-disable-line @typescript-eslint/no-unused-vars
import { PROGRAM_ID } from "../programId";

export interface UserWithdrawRewardArgs {
  rewardNumber: BN;
}

export interface UserWithdrawRewardAccounts {
  signer: PublicKey;
  userRewards: PublicKey;
  stake: PublicKey;
  reward: PublicKey;
  rewardSigner: PublicKey;
  rewardState: PublicKey;
  vault: PublicKey;
  userVault: PublicKey;
  tokenProgram: PublicKey;
  systemProgram: PublicKey;
}

export const layout = borsh.struct([borsh.u64("rewardNumber")]);

export function userWithdrawReward(args: UserWithdrawRewardArgs, accounts: UserWithdrawRewardAccounts) {
  const keys = [
    { pubkey: accounts.signer, isSigner: true, isWritable: false },
    { pubkey: accounts.userRewards, isSigner: false, isWritable: true },
    { pubkey: accounts.stake, isSigner: false, isWritable: false },
    { pubkey: accounts.reward, isSigner: false, isWritable: false },
    { pubkey: accounts.rewardSigner, isSigner: false, isWritable: false },
    { pubkey: accounts.rewardState, isSigner: false, isWritable: false },
    { pubkey: accounts.vault, isSigner: false, isWritable: true },
    { pubkey: accounts.userVault, isSigner: false, isWritable: true },
    { pubkey: accounts.tokenProgram, isSigner: false, isWritable: false },
    { pubkey: accounts.systemProgram, isSigner: false, isWritable: false },
  ];
  const identifier = Buffer.from([53, 224, 52, 140, 223, 202, 132, 43]);
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
