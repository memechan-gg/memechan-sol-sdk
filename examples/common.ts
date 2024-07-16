import { Wallet } from "@coral-xyz/anchor";
import { Connection, FetchMiddleware, Keypair } from "@solana/web3.js";
import { ADMIN_PUB_KEY, Auth, BE_URL, MemechanClient, TokenAPI } from "../src";
import { HELIUS_API_KEY, HELIUS_API_URL, IS_TEST_ENV, TEST_USER_SECRET_KEY } from "./env";
import { HeliusApi } from "../src/helius-api/HeliusApi";
import { MemechanClientV2 } from "../src/MemechanClientV2";

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

export const connection = new Connection("https://rpc1.memechan.xyz/", {
  httpAgent: IS_TEST_ENV ? false : undefined,
  commitment: "confirmed",
  confirmTransactionInitialTimeout: 30000,
  fetchMiddleware: connectionMiddleware,
});

export const admin = ADMIN_PUB_KEY;
export const payer = Keypair.fromSecretKey(Buffer.from(JSON.parse(TEST_USER_SECRET_KEY)));
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
