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
export const MEMECHAN_PROGRAM_ID = "2WRqhjrZUkMvvKPNg6KLCJwuqNdNjF4cjhGN2VWw1YeK";

export const MEMECHAN_QUOTE_MINT = new PublicKey("Do6NqMhU5sHA9p11FVePcPN4rxEjNGu6ZH2B2bCpQfpJ");
export const MEMECHAN_TARGET_CONFIG = "5cdqbrwSMEeubReme7g72VZ7zLVvab4LMnKwydsqQMCR";
// https://explorer.solana.com/address/7BgBvyjrZX1YKz4oh9mjb8ZScatkkwb8DzFx7LoiVkM3
export const SLERF_DECIMALS = 9;
export const MEMECHAN_MEMECOIN_DECIMALS = 6;
export const MEMECHAN_QUOTE_TOKEN: Token = new Token(
  TOKEN_PROGRAM_ID,
  MEMECHAN_QUOTE_MINT,
  SLERF_DECIMALS,
  "SLERF",
  "SLERF",
);

// Contract constants
export const MAX_TICKET_TOKENS = 900_000_000;
export const MAX_MEME_TOKENS = 1_125_000_000;

export const DEFAULT_PRICE_FACTOR = 2;
export const DEFAULT_MAX_M_LP = 200_000_000_000_000;
export const DEFAULT_MAX_M = 900_000_000_000_000;
export const DEFAULT_MAX_S = 300;

export const DECIMALS_ALPHA = 1_000_000; // consider increase
export const DECIMALS_BETA = 1_000_000; // consider increase
