import { TOKEN_PROGRAM_ID } from "@raydium-io/raydium-sdk";
import { PublicKey } from "@solana/web3.js";
import BigNumber from "bignumber.js";
import { TokenInfo } from "./types";
import BN from "bn.js";

export const NATIVE_MINT = new PublicKey("So11111111111111111111111111111111111111112");

export const MERCURIAL_AMM_PROGRAM_ID = "Eo7WjKq67rjJQSZxS6z3YkapzY3eMj6Xy8X5EQVn5UaB";

export const BE_URL_DEV = "https://dmgrnigolfno6.cloudfront.net";

/**
 * The base URL for the backend API for fetching off-chain data.
 * This endpoint ideally should point to the environment-specific endpoint, but currently it's only prod one
 *
 * @constant {string}
 */
export const BE_URL = "https://api.memechan.gg";
// export const BE_URL = BE_URL_DEV;

export const BE_REGION = "us-east-1";

export const API_GATEWAY_FQDN = "h9crl8krnj.execute-api.us-east-1.amazonaws.com";
// export const API_GATEWAY_FQDN = "waqxcrbt93.execute-api.us-east-1.amazonaws.com"; // dev

/**
 * The Memechan program ID on Solana.
 * This is the entry point of the Memechan smart contract.
 *
 * Be aware, that the same program address should be specified in IDL (`src/idl/memechan_sol.json`)
 *
 * @constant {string}
 */
// export const MEMECHAN_PROGRAM_ID = "cYsHcSU42XESLPquuN1ga94jm1wVMg11wVcxqvofA3k"; // dev

export const MEMECHAN_PROGRAM_ID = "memeVtsr1AqAjfRzW2PuzymQdP2m7SgL6FQ1xgMc9MR";

export const MEMECHAN_PROGRAM_ID_PK = new PublicKey(MEMECHAN_PROGRAM_ID);

/**
 * The Memechan program ID on Solana.
 * This is the entry point of the Memechan smart contract.
 *
 * Be aware, that the same program address should be specified in IDL (`src/idl/memechan_sol.json`)
 *
 * @constant {string}
 */
// export const MEMECHAN_PROGRAM_ID_V2 = "CaR9ciDnNnE6WX35tZWrjeGdKUPaft7r4oQGF4JhwVxZ"; // dev

export const MEMECHAN_PROGRAM_ID_V2 = "chv2ogo3QopnnGctZM9Hxo2VCQ2zEcvQy6Uo6XVpiRH";

export const MEMECHAN_PROGRAM_ID_V2_PK = new PublicKey(MEMECHAN_PROGRAM_ID_V2);

/**
 * The Memechan fee wallet id.
 * This address collects fee from memechan protocol
 *
 * @constant {string}
 */
export const MEMECHAN_FEE_WALLET_ID = "feeLPZEfzJFwDR11cdMWE3nSa4nr7sPPM4u6tmDTw3Y";

export const BOUND_POOL_FEE_WALLET = "6YNJG9KDex3eNAmh1i64KUDbfKBiESkew3AWmnf6FiCy";
export const LP_FEE_WALLET = "HQ1wVLaBcnuoUozegyX7r45yn6ogHvQjdPNj53iweC5V";
export const SWAP_FEE_WALLET = "xqzvZzKFCjvPuRqkyg5rxA95avrvJxesZ41rCLfYwUM";

// export const RAYDIUM_PROTOCOL_FEE = 1_000_000_000; // 1 SOL on Devnet. TODO on Mainnet, it's only 0.4 SOL
export const RAYDIUM_PROTOCOL_FEE = 400_000_000; // 0.4 SOL on Mainnet.

export const TRANSFER_FEE = 60_000_000;
export const COMPUTE_UNIT_PRICE = 200_000; // priority fee. 0.2 lamports per compute unit
// export const FEE_DESTINATION_ID = "3XMrhbv989VxAMi3DErLV9eJht1pHppW5LbKxe9fkEFR"; // devnet

export const FEE_DESTINATION_ID = "7YttLkHDoNj9wyDur5pM1ejNaAvT9X4eqaYcHQqtj2G5";

// export const SLERF_MINT = new PublicKey("7BgBvyjrZX1YKz4oh9mjb8ZScatkkwb8DzFx7LoiVkM3");

// https://explorer.solana.com/address/35fN6LMYt6cKsemgbR28nFooiJtcnvaKPCeRXyuMKfoF
export const PATS_MINT = new PublicKey("35fN6LMYt6cKsemgbR28nFooiJtcnvaKPCeRXyuMKfoF");

export const BOUND_POOL_VESTING_PERIOD = new BN(259200); // 3 days

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

// using PDAs now. kept for reference
// export const TOKEN_INFOS: { [symbol: string]: TokenInfo } = {
//   WSOL: new TokenInfo({
//     programId: TOKEN_PROGRAM_ID,
//     mint: NATIVE_MINT,
//     decimals: 9,
//     name: "SOL",
//     symbol: "SOL",
//     targetConfig: new PublicKey("C1PwZ2gxgfk3Bzku1fvRGBXeoTVnxteLiTDq3JLxvJTP"),
//     targetConfigV2: new PublicKey("Bc4kmp2Mq7BqMpDRFNVcBzC4otPFs297URe7nPJze4RQ"),
//   }),
//   SLERF: new TokenInfo({
//     programId: TOKEN_PROGRAM_ID,
//     mint: new PublicKey("7BgBvyjrZX1YKz4oh9mjb8ZScatkkwb8DzFx7LoiVkM3"),
//     decimals: 9,
//     name: "SLERF",
//     symbol: "SLERF",
//     targetConfig: new PublicKey("5g13tz8GKWySjtzPRARuzzQM7LbMCUBMPGPef5PKe4JJ"),
//     targetConfigV2: new PublicKey("5g13tz8GKWySjtzPRARuzzQM7LbMCUBMPGPef5PKe4JJ"), // TODO
//   }),
//   CHAN: new TokenInfo({
//     programId: TOKEN_PROGRAM_ID,
//     // mint: new PublicKey("ChanGGuDHboPswpTmKDfsTVGQL96VHhmvpwrE4UjWssd"),
//     mint: new PublicKey("9pECN2xxLQo22bFYpsNr3T3eW1UdEDtSqPQopFrGv7n4"),
//     decimals: 9,
//     symbol: "CHAN",
//     name: "memechan",
//     targetConfig: new PublicKey("5g13tz8GKWySjtzPRARuzzQM7LbMCUBMPGPef5PKe4JJ"), // TODO?
//     targetConfigV2: new PublicKey("5g13tz8GKWySjtzPRARuzzQM7LbMCUBMPGPef5PKe4JJ"), // TODO?
//   }),
// };

export const TOKEN_INFOS: { [symbol: string]: TokenInfo } = {
  WSOL: new TokenInfo({
    programId: TOKEN_PROGRAM_ID,
    mint: NATIVE_MINT,
    decimals: 9,
    name: "SOL",
    symbol: "SOL",
  }),
  SLERF: new TokenInfo({
    programId: TOKEN_PROGRAM_ID,
    mint: new PublicKey("7BgBvyjrZX1YKz4oh9mjb8ZScatkkwb8DzFx7LoiVkM3"),
    decimals: 9,
    name: "SLERF",
    symbol: "SLERF",
  }),
  CHAN: new TokenInfo({
    programId: TOKEN_PROGRAM_ID,
    mint: new PublicKey("ChanGGuDHboPswpTmKDfsTVGQL96VHhmvpwrE4UjWssd"),
    // mint: new PublicKey("9pECN2xxLQo22bFYpsNr3T3eW1UdEDtSqPQopFrGv7n4"),
    decimals: 9,
    symbol: "CHAN",
    name: "memechan",
  }),
};

export const MEMECHAN_MEME_TOKEN_DECIMALS = 6;

// Contract constants
export const MEME_TOKEN_DECIMALS = 1_000_000;
export const WSOL_DECIMALS = 1_000_000_000;
export const DEFAULT_MAX_M_LP = 310_000_000_000_000;
export const DEFAULT_MAX_M = 690_000_000_000_000;
export const MAX_MEME_TOKENS = 1_000_000_000;
export const MAX_TICKET_TOKENS = 690_000_000;

export const MAX_TRANSACTION_SIZE = 1232;
// Backend Wallet Address
// export const ADMIN_PUB_KEY = new PublicKey("2a59VXzDwcUvkTMa2eDkfKdmgeBZxEKcdzxsAGYeZGbd"); // dev
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

export const DEFAULT_ON_CHAIN_ADDRESS = new PublicKey("11111111111111111111111111111111");
