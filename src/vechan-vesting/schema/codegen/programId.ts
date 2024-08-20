import { PublicKey } from "@solana/web3.js";

// This constant will not get overwritten on subsequent code generations and it's safe to modify it's value.
const PROGRAM_ID_IDL: PublicKey = new PublicKey("vestJGg7ZMQoXiAr2pLV5cqgtxFhEWzNoZL5Ngzb8H4");

export const PROGRAM_ID: PublicKey = process.env.NEXT_PUBLIC_VESTING_PROGRAM_ID
  ? new PublicKey(process.env.NEXT_PUBLIC_VESTING_PROGRAM_ID)
  : PROGRAM_ID_IDL;
