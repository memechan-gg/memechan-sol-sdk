import { PublicKey } from "@solana/web3.js";
import dotenv from "dotenv";

dotenv.config();

// Program ID defined in the provided IDL. Do not edit, it will get overwritten.
export const PROGRAM_ID_IDL = new PublicKey("CaR9ciDnNnE6WX35tZWrjeGdKUPaft7r4oQGF4JhwVxZ");

export const PROGRAM_ID: PublicKey = process.env.MEMECHAN_PROGRAM_ID_V2
  ? new PublicKey(process.env.MEMECHAN_PROGRAM_ID_V2)
  : PROGRAM_ID_IDL;
