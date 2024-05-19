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
export const MEMECHAN_PROGRAM_ID = "BkDHXFyVk2SGhR6XRsWeb6ESNZ8ss1ybsz1fNpwF39Xp";
