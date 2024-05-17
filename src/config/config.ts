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
 * @constant {string}
 */
export const MEMECHAN_PROGRAM_ID = "HvGgKbPfar5eUAnE5gnq5NvFdJRMVo39PFjJ4Hhe5FGk";
