import { PublicKey } from "@solana/web3.js";
import { MEMECHAN_PROGRAM_ID_PK } from "../../config/config";

// Program ID defined in the provided IDL. Do not edit, it will get overwritten.
export const PROGRAM_ID_IDL = new PublicKey("memeVtsr1AqAjfRzW2PuzymQdP2m7SgL6FQ1xgMc9MR");

// This constant will not get overwritten on subsequent code generations and it's safe to modify it's value.
export const PROGRAM_ID: PublicKey = MEMECHAN_PROGRAM_ID_PK;
