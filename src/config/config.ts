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
export const COMPUTE_UNIT_PRICE = 100_000; // priority fee
// export const FEE_DESTINATION_ID = "3XMrhbv989VxAMi3DErLV9eJht1pHppW5LbKxe9fkEFR"; // devnet

export const FEE_DESTINATION_ID = "7YttLkHDoNj9wyDur5pM1ejNaAvT9X4eqaYcHQqtj2G5";

export const SLERF_MINT = new PublicKey("7BgBvyjrZX1YKz4oh9mjb8ZScatkkwb8DzFx7LoiVkM3");

// TODO: Replace it with SLERF Mint when prod
export const MEMECHAN_QUOTE_MINT = new PublicKey("9pECN2xxLQo22bFYpsNr3T3eW1UdEDtSqPQopFrGv7n4");
// TODO: Replace it with the actual value
export const MEMECHAN_TARGET_CONFIG = new PublicKey("EEeLC1a7qbK2mbvfYt8owGzQcBjYguE1FWhWYuGjyABu");
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

export const endpoints = [
  "https://mainnet.helius-rpc.com/?api-key=0c67a072-1b07-4577-85f9-1f13c970f512",
  "https://mainnet.helius-rpc.com/?api-key=b53301be-1754-49be-8678-f00697dcb122",
  "https://mainnet.helius-rpc.com/?api-key=23910eea-83b1-496a-8a37-a0dbef749c1a",
  "https://mainnet.helius-rpc.com/?api-key=64db3acd-9966-4fa6-87f1-fdfe49d91331",
  "https://mainnet.helius-rpc.com/?api-key=d4f4f14b-fe2a-4683-af42-31d2dadd0b55",
  "https://mainnet.helius-rpc.com/?api-key=975f47f7-41dd-4e0f-a2b5-2578433464d0",
  "https://mainnet.helius-rpc.com/?api-key=0c3a2165-2fe4-40bb-885a-8bba8b339534",
  "https://mainnet.helius-rpc.com/?api-key=d4f5cafd-b34e-4669-9dd3-fe75f3fcc605",
  "https://mainnet.helius-rpc.com/?api-key=c6b0b953-9fd6-4385-8961-ebc6738165a4",
  "https://mainnet.helius-rpc.com/?api-key=5c5b5e12-1e29-4ed8-9f00-c033c04200d1",
  "https://mainnet.helius-rpc.com/?api-key=68628f9a-4f6f-4239-8409-de71e4b25c36",
  "https://mainnet.helius-rpc.com/?api-key=44b6323a-2424-4889-b8a1-d0422d751a79",
  "https://mainnet.helius-rpc.com/?api-key=8a164901-8085-411d-b07b-3fb88408e790",
  "https://mainnet.helius-rpc.com/?api-key=701db841-523f-49ad-ad2e-3cb8af862ad9",
  "https://mainnet.helius-rpc.com/?api-key=a2e41beb-0934-450e-945b-80f6f7c58632",
  "https://mainnet.helius-rpc.com/?api-key=1598b1d6-66ad-4e08-82cb-6902cbee092a",
  "https://mainnet.helius-rpc.com/?api-key=bf70640b-1e75-4e3c-aca6-939c06ebb31f",
  "https://mainnet.helius-rpc.com/?api-key=fee187a0-4794-44af-98ee-24ead8aef7cc",
  "https://mainnet.helius-rpc.com/?api-key=5ae1e47c-6a65-4d1c-810c-3f546d8184b3",
  "https://mainnet.helius-rpc.com/?api-key=7bc9950b-91b8-4ac5-8fe1-ac8b759595ac",
  "https://mainnet.helius-rpc.com/?api-key=24760e19-ad7e-4b5c-939b-4677be2ca041",
  "https://mainnet.helius-rpc.com/?api-key=28685dcc-7500-4b9a-83ad-d046eb965933",
  "https://mainnet.helius-rpc.com/?api-key=e3d27fe4-1b88-4313-9264-0fb9186544e3",
  "https://mainnet.helius-rpc.com/?api-key=80c05cdf-3efe-4126-8c6c-fcf66ef82075",
  "https://mainnet.helius-rpc.com/?api-key=adf1d18c-9b45-420a-9235-648a0412b15d",
  "https://mainnet.helius-rpc.com/?api-key=f27bfacf-9f92-4718-8641-386b95dae861",
  "https://mainnet.helius-rpc.com/?api-key=4be21dd1-bd1a-4c32-bd90-5c44ba871c04",
  "https://mainnet.helius-rpc.com/?api-key=ee964c22-b0b7-415a-b857-ee1bc28db7a2",
  "https://mainnet.helius-rpc.com/?api-key=64eafd76-7c59-42c3-a564-8cd48ec87c97",
];
