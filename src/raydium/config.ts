import { ENDPOINT as _ENDPOINT, MAINNET_PROGRAM_ID, TxVersion, LOOKUP_TABLE_CACHE } from "@raydium-io/raydium-sdk";
import { PublicKey } from "@solana/web3.js";

export const PROGRAMIDS = MAINNET_PROGRAM_ID;

export const ENDPOINT = _ENDPOINT;

export const ATA_PROGRAM_ID = new PublicKey("ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL");

export const makeTxVersion = TxVersion.LEGACY; // LEGACY

export const addLookupTableInfo = LOOKUP_TABLE_CACHE; // only mainnet. other = undefined
//export const addLookupTableInfo = undefined;
