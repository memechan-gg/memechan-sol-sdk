import { TOKEN_PROGRAM_ID, Token } from "@raydium-io/raydium-sdk";
import { PublicKey } from "@solana/web3.js";
import BigNumber from "bignumber.js";

/**
 * The base URL for the backend API for fetching off-chain data.
 * This endpoint ideally should point to the environment-specific endpoint, but currently it's only prod one
 *
 * @constant {string}
 */
export const PROD_BE_URL = "https://h9crl8krnj.execute-api.us-east-1.amazonaws.com/prod";
export const BE_URL = "https://h9crl8krnj.execute-api.us-east-1.amazonaws.com/prod";

// export const BE_URL = "https://waqxcrbt93.execute-api.us-east-1.amazonaws.com/prod"; // dev
export const BE_REGION = "us-east-1";

/**
 * The Memechan program ID on Solana.
 * This is the entry point of the Memechan smart contract.
 *
 * Be aware, that the same program address should be specified in IDL (`src/idl/memechan_sol.json`)
 *
 * @constant {string}
 */
export const MEMECHAN_PROGRAM_ID = "cYsHcSU42XESLPquuN1ga94jm1wVMg11wVcxqvofA3k";
// export const RAYDIUM_PROTOCOL_FEE = 1_000_000_000; // 1 SOL on Devnet. TODO on Mainnet, it's only 0.4 SOL

export const RAYDIUM_PROTOCOL_FEE = 400_000_000; // 0.4 SOL on Mainnet.

export const TRANSFER_FEE = 60_000_000;
export const COMPUTE_UNIT_PRICE = 100_000; // priority fee
// export const FEE_DESTINATION_ID = "3XMrhbv989VxAMi3DErLV9eJht1pHppW5LbKxe9fkEFR"; // devnet

export const FEE_DESTINATION_ID = "7YttLkHDoNj9wyDur5pM1ejNaAvT9X4eqaYcHQqtj2G5";

export const SLERF_MINT = new PublicKey("7BgBvyjrZX1YKz4oh9mjb8ZScatkkwb8DzFx7LoiVkM3");

// TODO: Replace it with SLERF Mint when prod
export const MEMECHAN_QUOTE_MINT = new PublicKey("9pECN2xxLQo22bFYpsNr3T3eW1UdEDtSqPQopFrGv7n4");
// TODO: Replace it with the actual value
export const MEMECHAN_TARGET_CONFIG = new PublicKey("H3vkkiCoXWESVK2FGUa561XtC41g73sRgx4h3tQJNAov");
export const MEMECHAN_QUOTE_TOKEN_DECIMALS = 9; // current devnet quote token decimals
export const MEMECHAN_QUOTE_TOKEN: Token = new Token(
  TOKEN_PROGRAM_ID,
  MEMECHAN_QUOTE_MINT,
  MEMECHAN_QUOTE_TOKEN_DECIMALS,
  "SLERF",
  "SLERF",
);
export const MEMECHAN_MEME_TOKEN_DECIMALS = 6;

// Contract constants
export const MEME_TOKEN_DECIMALS = 1_000_000;
export const WSOL_DECIMALS = 1_000_000_000;
export const MAX_TICKET_TOKENS = 800_000_000;
export const MAX_MEME_TOKENS = 1_000_000_000;

export const DEFAULT_PRICE_FACTOR = 2;
export const DEFAULT_MAX_M_LP = 200_000_000_000_000;
export const DEFAULT_MAX_M = 800_000_000_000_000;

export const DECIMALS_S = 1_000_000_000;

export const MAX_TRANSACTION_SIZE = 1232;
export const ADMIN_PUB_KEY = new PublicKey("KZbAoMgCcb2gDEn2Ucea86ux84y25y3ybbWQGQpd9D6");
export const FULL_MEME_AMOUNT_CONVERTED = new BigNumber(DEFAULT_MAX_M_LP)
  .plus(DEFAULT_MAX_M)
  .div(10 ** MEMECHAN_MEME_TOKEN_DECIMALS)
  .toString();
