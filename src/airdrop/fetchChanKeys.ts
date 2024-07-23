import { Program } from "@coral-xyz/anchor";
import { CHAN_TOKEN, VESTING_PROGRAM_ID } from "../config/config";
import { IDL, Lockup } from "../vesting/schema/types/lockup";
import { PublicKey } from "@solana/web3.js";
import { BN } from "bn.js";

export async function fetchChanKeys(): Promise<PublicKey[]> {
  const vestingProgram = new Program<Lockup>(IDL, VESTING_PROGRAM_ID);

  const allVestings = await vestingProgram.account.vesting.all();

  const vestorKeys = allVestings
    .filter((vesting) => vesting.account.mint.equals(CHAN_TOKEN) && !vesting.account.outstanding.eq(new BN(0)))
    .map((vesting) => vesting.account.beneficiary);

  const mergedVestors = new Set(vestorKeys);

  return Array.from(mergedVestors);
}
