import { PublicKey } from "@solana/web3.js";
import { VESTING_PROGRAM_ID } from "../config/config";

const programId = VESTING_PROGRAM_ID;

export function getStakingStatePDA(vMint: PublicKey, veMint: PublicKey): PublicKey {
  return PublicKey.findProgramAddressSync(
    [Buffer.from("staking_state"), vMint.toBytes(), veMint.toBytes()],
    programId,
  )[0];
}
export function getStakingStateSigner(stakingState: PublicKey): PublicKey {
  return PublicKey.findProgramAddressSync([Buffer.from("staking_state_signer"), stakingState.toBytes()], programId)[0];
}
export function getVestingPDA(beneficiary: PublicKey, vMint: PublicKey): PublicKey {
  return PublicKey.findProgramAddressSync(
    [Buffer.from("vesting"), beneficiary.toBytes(), vMint.toBytes()],
    programId,
  )[0];
}
export function getVestingSignerPDA(publicKey: PublicKey): PublicKey {
  return PublicKey.findProgramAddressSync([Buffer.from("vesting_signer"), publicKey.toBytes()], programId)[0];
}
export function getUserStakePDA(beneficiary: PublicKey, vMint: PublicKey): PublicKey {
  return PublicKey.findProgramAddressSync(
    [Buffer.from("user_stake"), beneficiary.toBytes(), vMint.toBytes()],
    programId,
  )[0];
}
export function getUserStakeSigner(stake: PublicKey): PublicKey {
  return PublicKey.findProgramAddressSync([Buffer.from("stake_signer"), stake.toBytes()], programId)[0];
}

export function getUserRewardsPDA(rewardState: PublicKey, stake: PublicKey): PublicKey {
  return PublicKey.findProgramAddressSync(
    [Buffer.from("user_rewards"), rewardState.toBytes(), stake.toBytes()],
    programId,
  )[0];
}

export function getRewardStatePDA(mint: PublicKey, stakingState: PublicKey): PublicKey {
  return PublicKey.findProgramAddressSync(
    [Buffer.from("reward_state"), mint.toBytes(), stakingState.toBytes()],
    programId,
  )[0];
}

export function getRewardPDA(rewardState: PublicKey, rewardNumber: number): PublicKey {
  // 8 bytes array
  const dv = new DataView(new ArrayBuffer(8), 0);
  // set u64 in little endian format
  dv.setBigUint64(0, BigInt(rewardNumber), true);

  // find pda
  return PublicKey.findProgramAddressSync(
    [Buffer.from("reward"), rewardState.toBytes(), new Uint8Array(dv.buffer)],
    programId,
  )[0];
}

export function getRewardSigner(reward: PublicKey): PublicKey {
  return PublicKey.findProgramAddressSync([Buffer.from("reward_signer"), reward.toBytes()], programId)[0];
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function tryDisplayFetched(object: any) {
  let fieldsConcat = "";
  for (const key of Object.keys(object)) {
    fieldsConcat = `${fieldsConcat}\n ${key} ${object[key].toString()}`;
  }
  return fieldsConcat;
}
