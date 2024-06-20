import { TOKEN_PROGRAM_ID } from "@raydium-io/raydium-sdk";
import { PublicKey } from "@solana/web3.js";
import BigNumber from "bignumber.js";
import { TokenInfo } from "./types";
import { NATIVE_MINT } from "@solana/spl-token";

export const BE_URL_DEV = "https://dmgrnigolfno6.cloudfront.net";

/**
 * The base URL for the backend API for fetching off-chain data.
 * This endpoint ideally should point to the environment-specific endpoint, but currently it's only prod one
 *
 * @constant {string}
 */
// export const BE_URL = "https://api.memechan.gg";
export const BE_URL = BE_URL_DEV;

export const BE_REGION = "us-east-1";

// export const API_GATEWAY_FQDN = "h9crl8krnj.execute-api.us-east-1.amazonaws.com";
export const API_GATEWAY_FQDN = "waqxcrbt93.execute-api.us-east-1.amazonaws.com"; // dev

/**
 * The Memechan program ID on Solana.
 * This is the entry point of the Memechan smart contract.
 *
 * Be aware, that the same program address should be specified in IDL (`src/idl/memechan_sol.json`)
 *
 * @constant {string}
 */
export const MEMECHAN_PROGRAM_ID = "cYsHcSU42XESLPquuN1ga94jm1wVMg11wVcxqvofA3k";

/**
 * The Memechan fee wallet id.
 * This address collects fee from memechan protocol
 *
 * @constant {string}
 */
export const MEMECHAN_FEE_WALLET_ID = "feeLPZEfzJFwDR11cdMWE3nSa4nr7sPPM4u6tmDTw3Y";

// export const RAYDIUM_PROTOCOL_FEE = 1_000_000_000; // 1 SOL on Devnet. TODO on Mainnet, it's only 0.4 SOL
export const RAYDIUM_PROTOCOL_FEE = 400_000_000; // 0.4 SOL on Mainnet.

export const TRANSFER_FEE = 60_000_000;
export const COMPUTE_UNIT_PRICE = 200_000; // priority fee. 0.2 lamports per compute unit
// export const FEE_DESTINATION_ID = "3XMrhbv989VxAMi3DErLV9eJht1pHppW5LbKxe9fkEFR"; // devnet

export const FEE_DESTINATION_ID = "7YttLkHDoNj9wyDur5pM1ejNaAvT9X4eqaYcHQqtj2G5";

// export const SLERF_MINT = new PublicKey("7BgBvyjrZX1YKz4oh9mjb8ZScatkkwb8DzFx7LoiVkM3");

// https://explorer.solana.com/address/35fN6LMYt6cKsemgbR28nFooiJtcnvaKPCeRXyuMKfoF
export const PATS_MINT = new PublicKey("35fN6LMYt6cKsemgbR28nFooiJtcnvaKPCeRXyuMKfoF");

// export const MEMECHAN_QUOTE_MINT = new PublicKey("So11111111111111111111111111111111111111112"); // dev fake slerf
// export const MEMECHAN_QUOTE_MINT = SLERF_MINT; // prod
// export const MEMECHAN_TARGET_CONFIG = new PublicKey("5g13tz8GKWySjtzPRARuzzQM7LbMCUBMPGPef5PKe4JJ"); // prod
// export const MEMECHAN_TARGET_CONFIG = new PublicKey("C1PwZ2gxgfk3Bzku1fvRGBXeoTVnxteLiTDq3JLxvJTP"); // dev
// export const MEMECHAN_QUOTE_TOKEN_DECIMALS = 9; // current devnet quote token decimals
// export const MEMECHAN_QUOTE_TOKEN: Token = new Token(
//   TOKEN_PROGRAM_ID,
//   MEMECHAN_QUOTE_MINT,
//   MEMECHAN_QUOTE_TOKEN_DECIMALS,
//   "WSOL",
//   "WSOL",
// );

export const TOKEN_INFOS: { [symbol: string]: TokenInfo } = {
  WSOL: new TokenInfo(
    TOKEN_PROGRAM_ID,
    NATIVE_MINT,
    9,
    "WSOL",
    "WSOL",
    new PublicKey("C1PwZ2gxgfk3Bzku1fvRGBXeoTVnxteLiTDq3JLxvJTP"),
    "SOL",
  ),
  // SLERF: {
  //   mint: new PublicKey("7BgBvyjrZX1YKz4oh9mjb8ZScatkkwb8DzFx7LoiVkM3"),
  //   targetConfig: new PublicKey("5g13tz8GKWySjtzPRARuzzQM7LbMCUBMPGPef5PKe4JJ"),
  //   decimals: 9,
  //   name: "SLERF",
  // },
  SLERF:
    // dev
    new TokenInfo(
      TOKEN_PROGRAM_ID,
      new PublicKey("9pECN2xxLQo22bFYpsNr3T3eW1UdEDtSqPQopFrGv7n4"),
      9,
      "SLERF",
      "SLERF",
      new PublicKey("EEeLC1a7qbK2mbvfYt8owGzQcBjYguE1FWhWYuGjyABu"),
    ),
};

export const MEMECHAN_MEME_TOKEN_DECIMALS = 6;

// Contract constants
export const MEME_TOKEN_DECIMALS = 1_000_000;
export const WSOL_DECIMALS = 1_000_000_000;
export const MAX_MEME_TOKENS = 1_000_000_000;

export const DEFAULT_MAX_M_LP = 200_000_000_000_000;
export const DEFAULT_MAX_M = 800_000_000_000_000;

export const MAX_TRANSACTION_SIZE = 1232;
export const ADMIN_PUB_KEY = new PublicKey("KZbAoMgCcb2gDEn2Ucea86ux84y25y3ybbWQGQpd9D6");
export const FULL_MEME_AMOUNT_CONVERTED = new BigNumber(DEFAULT_MAX_M_LP)
  .plus(DEFAULT_MAX_M)
  .div(10 ** MEMECHAN_MEME_TOKEN_DECIMALS)
  .toString();

export const endpoints = ["https://rpc1.memechan.xyz/"];

export const CHUNK_SIZE_FOR_GET_MULTIPLE_ACCOUNTS = 100;

// Vesting

export const VESTING_PROGRAM_ID = new PublicKey("vestJGg7ZMQoXiAr2pLV5cqgtxFhEWzNoZL5Ngzb8H4");

// Pre-sale

export const PRESALE_ADDRESS = new PublicKey("AXen9e3RFS46k8n29TLsUc65ngnyPCB6L2pazyLZQEX5");
export const CHAN_TOKEN = new PublicKey("ChanGGuDHboPswpTmKDfsTVGQL96VHhmvpwrE4UjWssd");
export const CHAN_TOKEN_DECIMALS = 9;
export const PRESALE_AMOUNT_IN_CHAN = new BigNumber(380_000_000);
export const PRESALE_AMOUNT_IN_CHAN_RAW = PRESALE_AMOUNT_IN_CHAN.multipliedBy(10 ** CHAN_TOKEN_DECIMALS);
