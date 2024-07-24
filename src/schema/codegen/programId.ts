import { PublicKey } from "@solana/web3.js";
import dotenv from "dotenv";

dotenv.config();

// Program ID defined in the provided IDL. Do not edit, it will get overwritten.
export const PROGRAM_ID_IDL = new PublicKey("memeVtsr1AqAjfRzW2PuzymQdP2m7SgL6FQ1xgMc9MR");

// It might get overriden during code generation

export const PROGRAM_ID: PublicKey = process.env.MEMECHAN_PROGRAM_ID
  ? new PublicKey(process.env.MEMECHAN_PROGRAM_ID)
  : PROGRAM_ID_IDL;
