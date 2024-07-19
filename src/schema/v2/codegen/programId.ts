import { PublicKey } from "@solana/web3.js";
import { MEMECHAN_PROGRAM_ID_V2_PK } from "../../../config/config";

// Program ID defined in the provided IDL. Do not edit, it will get overwritten.
export const PROGRAM_ID_IDL = new PublicKey("chv2ogo3QopnnGctZM9Hxo2VCQ2zEcvQy6Uo6XVpiRH");

// This constant will not get overwritten on subsequent code generations and it's safe to modify it's value.
export const PROGRAM_ID: PublicKey = MEMECHAN_PROGRAM_ID_V2_PK;
