import { TOKEN_PROGRAM_ID, Token } from "@raydium-io/raydium-sdk";
import { PublicKey } from "@solana/web3.js";

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
export const MEMECHAN_PROGRAM_ID = "FJuQ8pqDRKTmzrLASriYJBYUKRiRo9WWBJJwLe7C6ZLu";

export const MEMECHAN_QUOTE_MINT = new PublicKey("Do6NqMhU5sHA9p11FVePcPN4rxEjNGu6ZH2B2bCpQfpJ");
export const MEMECHAN_TARGET_CONFIG = new PublicKey("F3fnjGGcvsaK5CCrSYryBqcgcrpaTcBCPGNpjd5HSqL1");
export const MEMECHAN_QUOTE_TOKEN_DECIMALS = 9;
export const MEMECHAN_QUOTE_TOKEN: Token = new Token(
  TOKEN_PROGRAM_ID,
  MEMECHAN_QUOTE_MINT,
  MEMECHAN_QUOTE_TOKEN_DECIMALS,
  "SLERF",
  "SLERF",
);
export const MEMECHAN_MEME_TOKEN_DECIMALS = 6;

// Contract constants
export const MAX_TICKET_TOKENS = 900_000_000;
export const MAX_MEME_TOKENS = 1_125_000_000;

export const DEFAULT_PRICE_FACTOR = 2;
export const DEFAULT_MAX_M_LP = 200_000_000_000_000;
export const DEFAULT_MAX_M = 900_000_000_000_000;
export const DEFAULT_MAX_S = 300;

export const DECIMALS_ALPHA = 1_000_000; // consider increase
export const DECIMALS_BETA = 1_000_000; // consider increase
