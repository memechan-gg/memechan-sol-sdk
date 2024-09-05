import { PublicKey } from "@solana/web3.js";
import BN from "bn.js";
import devConfig from "./config.dev";
import prodConfig from "./config.prod";
import dotenv from "dotenv";
import BigNumber from "bignumber.js";

dotenv.config();

export function getEnvVar<T>(envVar: string, fallback: T): T {
  const value = process.env[envVar];
  if (value === undefined || value === null) {
    return fallback;
  }
  if (typeof fallback === "string") {
    return value as unknown as T;
  }
  if (typeof fallback === "number") {
    return parseFloat(value) as unknown as T;
  }
  if (typeof fallback === "boolean") {
    return (value === "true") as unknown as T;
  }
  if (fallback instanceof PublicKey) {
    return new PublicKey(value) as unknown as T;
  }
  if (fallback instanceof BN) {
    return new BN(value) as unknown as T;
  }
  throw new Error(`Unsupported type for env var: ${envVar}`);
}

const isProduction = process.env.NEXT_PUBLIC_SDK_ENV === "production";
console.log("isProduction", isProduction);
const configSource = isProduction ? prodConfig : devConfig;

export const BE_URL = getEnvVar("BE_URL", configSource.BE_URL);
export const API_GATEWAY_FQDN = getEnvVar("API_GATEWAY_FQDN", configSource.API_GATEWAY_FQDN);
export const FEE_DESTINATION_ID = getEnvVar("FEE_DESTINATION_ID", configSource.FEE_DESTINATION_ID);
export const ADMIN_PUB_KEY = getEnvVar("ADMIN_PUB_KEY", configSource.ADMIN_PUB_KEY);
export const MEMECHAN_PROGRAM_ID_PK = getEnvVar("MEMECHAN_PROGRAM_ID_PK", configSource.MEMECHAN_PROGRAM_ID_PK);
export const BE_REGION = getEnvVar("BE_REGION", configSource.BE_REGION);
export const BE_URL_DEV = getEnvVar("BE_URL_DEV", configSource.BE_URL_DEV);
export const BOUND_POOL_FEE_WALLET = getEnvVar("BOUND_POOL_FEE_WALLET", configSource.BOUND_POOL_FEE_WALLET);
export const BOUND_POOL_VESTING_PERIOD = getEnvVar("BOUND_POOL_VESTING_PERIOD", configSource.BOUND_POOL_VESTING_PERIOD);
export const LP_FEE_WALLET = getEnvVar("LP_FEE_WALLET", configSource.LP_FEE_WALLET);
export const MEMECHAN_FEE_WALLET_ID = getEnvVar("MEMECHAN_FEE_WALLET_ID", configSource.MEMECHAN_FEE_WALLET_ID);
export const MEMECHAN_PROGRAM_ID = getEnvVar("MEMECHAN_PROGRAM_ID", configSource.MEMECHAN_PROGRAM_ID);
export const MEMECHAN_PROGRAM_ID_V2 = getEnvVar("MEMECHAN_PROGRAM_ID_V2", configSource.MEMECHAN_PROGRAM_ID_V2);
export const MEMECHAN_PROGRAM_ID_V2_PK = getEnvVar("MEMECHAN_PROGRAM_ID_V2_PK", configSource.MEMECHAN_PROGRAM_ID_V2_PK);
export const PATS_MINT = getEnvVar("PATS_MINT", configSource.PATS_MINT);
export const SWAP_FEE_WALLET = getEnvVar("SWAP_FEE_WALLET", configSource.SWAP_FEE_WALLET);
export const TOKEN_INFOS = configSource.TOKEN_INFOS;
export const MERCURIAL_AMM_PROGRAM_ID = getEnvVar("MERCURIAL_AMM_PROGRAM_ID", configSource.MERCURIAL_AMM_PROGRAM_ID);
export const POINTS_MINT = getEnvVar("POINTS_MINT", configSource.POINTS_MINT);

export const MEMECHAN_MEME_TOKEN_DECIMALS = 6;
// Contract constants
export const MEME_TOKEN_DECIMALS = 1_000_000;
export const WSOL_DECIMALS = 1_000_000_000;
export const DEFAULT_MAX_M_LP = 200_000_000_000_000;
export const DEFAULT_MAX_M = 800_000_000_000_000;
export const MAX_MEME_TOKENS = 1_000_000_000;
export const MAX_TICKET_TOKENS = 800_000_000;

// v2
export const DEFAULT_MAX_M_LP_V2 = 310_000_000_000_000;
export const DEFAULT_MAX_M_V2 = 690_000_000_000_000;
export const MAX_TICKET_TOKENS_V2 = 690_000_000;

export const FULL_MEME_AMOUNT_CONVERTED = new BigNumber(DEFAULT_MAX_M_LP)
  .plus(DEFAULT_MAX_M)
  .div(10 ** MEMECHAN_MEME_TOKEN_DECIMALS)
  .toString();

export const FULL_MEME_AMOUNT_CONVERTED_V2 = new BigNumber(DEFAULT_MAX_M_LP_V2)
  .plus(DEFAULT_MAX_M_V2)
  .div(10 ** MEMECHAN_MEME_TOKEN_DECIMALS)
  .toString();

export const MAX_TRANSACTION_SIZE = 1232;
export const CHUNK_SIZE_FOR_GET_MULTIPLE_ACCOUNTS = 100;

export const COMPUTE_UNIT_PRICE = 200_000; // priority fee. 0.2 lamports per compute unit
export const RAYDIUM_PROTOCOL_FEE = 400_000_000; // 0.4 SOL on Mainnet.
export const TRANSFER_FEE = 60_000_000;

// These may have to be moved to env based configs

// Vesting
export const VESTING_PROGRAM_ID = getEnvVar("VESTING_PROGRAM_ID", configSource.VESTING_PROGRAM_ID);

// Pre-sale

export const PRESALE_ADDRESS = new PublicKey("AXen9e3RFS46k8n29TLsUc65ngnyPCB6L2pazyLZQEX5");
export const CHAN_TOKEN = new PublicKey("ChanGGuDHboPswpTmKDfsTVGQL96VHhmvpwrE4UjWssd");
export const CHAN_TOKEN_DECIMALS = 9;
export const PRESALE_AMOUNT_IN_CHAN = new BigNumber(380_000_000);
export const PRESALE_AMOUNT_IN_CHAN_RAW = PRESALE_AMOUNT_IN_CHAN.multipliedBy(10 ** CHAN_TOKEN_DECIMALS);
