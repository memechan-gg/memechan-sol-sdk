import { PublicKey } from "@solana/web3.js";
import dotenv from "dotenv";
import devConfig from "../../config/config.dev";
import prodConfig from "../../config/config.prod";
// import { getEnvVar } from "../../config/config";

dotenv.config();
// const isProduction = process.env.NODE_ENV === "production";
// const configSource = isProduction ? prodConfig : devConfig;

// Program ID defined in the provided IDL. Do not edit, it will get overwritten.
// export const PROGRAM_ID_IDL = new PublicKey("memeVtsr1AqAjfRzW2PuzymQdP2m7SgL6FQ1xgMc9MR");

// This constant will not get overwritten on subsequent code generations and it's safe to modify it's value.
// TODO fix. This is a placeholder
// export const PROGRAM_ID: PublicKey = getEnvVar("MEMECHAN_PROGRAM_ID_PK", configSource.MEMECHAN_PROGRAM_ID_PK);
export const PROGRAM_ID: PublicKey = new PublicKey(process.env.MEMECHAN_PROGRAM_ID_PK!);
