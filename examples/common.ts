import { Wallet } from "@coral-xyz/anchor";
import { Connection, FetchMiddleware, Keypair } from "@solana/web3.js";
import { ADMIN_PUB_KEY, Auth, BE_URL, MemechanClient, TokenAPI } from "../src";
import { HELIUS_API_KEY, HELIUS_API_URL, IS_TEST_ENV, TEST_USER_SECRET_KEY } from "./env";
import { HeliusApi } from "../src/helius-api/HeliusApi";
import { MemechanClientV2 } from "../src/MemechanClientV2";
import bs58 from "bs58";

export const connectionMiddleware = async (
  urlAddress: Parameters<FetchMiddleware>[0],
  optionArgs = {},
  // eslint-disable-next-line @typescript-eslint/ban-types
  callback: Function,
) => {
  try {
    console.log("[connectionMiddleware] urlAddress: ", urlAddress.toString());
    await callback(urlAddress, optionArgs);
  } catch (e) {
    console.log("[connectionMiddleware] Error: ", e, "urlAddress: ", urlAddress.toString());
    throw e;
  }
};

export const connection = new Connection("https://lusa-4nbpxk-fast-devnet.helius-rpc.com", {
  httpAgent: IS_TEST_ENV ? false : undefined,
  commitment: "confirmed",
  confirmTransactionInitialTimeout: 30000,
  fetchMiddleware: connectionMiddleware,
});

export const admin = ADMIN_PUB_KEY;

const base58SecretKey = "65AqFqdJVEBCdE5rWzPK2ajtgNQ8hdUBhA6L5vLBvy3WErpAybaHJNiiibC4mXfFitBp6RWHWX9ePSrUQvn3cexj";

// Decode the base58 private key
const secretKeyArray = bs58.decode(base58SecretKey);

// Create the Keypair from the secret key
export const payer = Keypair.fromSecretKey(secretKeyArray);
export const wallet = new Wallet(payer);

export const client = new MemechanClient({
  wallet,
  heliusApiUrl: HELIUS_API_URL,
  connection,
  simulationKeypair: payer,
});

export const clientV2 = new MemechanClientV2({
  wallet,
  heliusApiUrl: HELIUS_API_URL,
  connection,
  simulationKeypair: payer,
});

export const DUMMY_TOKEN_METADATA = {
  name: "Best Token Ever",
  symbol: "BTE",
  image: "https://cf-ipfs.com/ipfs/QmVevMfxFpfgBu5kHuYUPmDMaV6pWkAn3zw5XaCXxKdaBh",
  description: "This is the best token ever",
  twitter: "https://twitter.com/BestTokenEver",
  telegram: "https://t.me/BestTokenEver",
  website: "https://besttokenever.com",
  discord: "",
};

export const TokenApiInstance = new TokenAPI(BE_URL);
export const AuthApiInstance = new Auth(BE_URL);
export const HeliusApiInstance = new HeliusApi(HELIUS_API_URL, HELIUS_API_KEY);
