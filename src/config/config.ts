/**
 * The base URL for the backend API for fetching off-chain data.
 * This endpoint ideally should point to the environment-specific endpoint, but currently it's only prod one
 *
 * @constant {string}
 */
export const BE_URL = "https://7mgmqkuj18.execute-api.us-east-1.amazonaws.com/prod";

/**
 * The Memechan program ID on Solana.
 * This is the entry point of the Memechan smart contract.
 *
 * Be aware, that the same program address should be specified in IDL (`src/idl/memechan_sol.json`)
 *
 * @constant {string}
 */
export const MEMECHAN_PROGRAM_ID = "8e1Asi2foEGzoZWsGN7zuDFGHseDJgyu2gYr2qKAmFj";

export const MEMECHAN_TARGET_CONFIG = "B6xXRig7FsVGxnPVZLcHibECbPWWHaLSBBPea6Fi8MkR";
