import { PublicKey } from "@solana/web3.js";
import BigNumber from "bignumber.js";

export const NATIVE_MINT = new PublicKey("So11111111111111111111111111111111111111112");
export const TOKEN_PROGRAM_ID = new PublicKey("TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA");
export const DEFAULT_ON_CHAIN_ADDRESS = new PublicKey("11111111111111111111111111111111");

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
export const RAYDIUM_TRANSFER_FEE = 60_000_000;

// These may have to be moved to env based configs

// Vesting
export const VESTING_PROGRAM_ID = new PublicKey("vestJGg7ZMQoXiAr2pLV5cqgtxFhEWzNoZL5Ngzb8H4");

// Pre-sale

export const PRESALE_ADDRESS = new PublicKey("AXen9e3RFS46k8n29TLsUc65ngnyPCB6L2pazyLZQEX5");
export const CHAN_TOKEN = new PublicKey("ChanGGuDHboPswpTmKDfsTVGQL96VHhmvpwrE4UjWssd");
export const CHAN_TOKEN_DECIMALS = 9;
export const PRESALE_AMOUNT_IN_CHAN = new BigNumber(380_000_000);
export const PRESALE_AMOUNT_IN_CHAN_RAW = PRESALE_AMOUNT_IN_CHAN.multipliedBy(10 ** CHAN_TOKEN_DECIMALS);
