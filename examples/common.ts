import { Wallet } from "@coral-xyz/anchor";
import { Connection, Keypair } from "@solana/web3.js";
import { ADMIN_PUB_KEY, MemechanClient } from "../src";
import { HELIUS_API_URL, IS_TEST_ENV, TEST_USER_SECRET_KEY } from "./env";
import { getRandomRpcEndpoint } from "../src/util/getRandomRpcEndpoint";

export const connection = new Connection(getRandomRpcEndpoint(), {
  httpAgent: IS_TEST_ENV ? false : undefined,
  commitment: "confirmed",
  confirmTransactionInitialTimeout: 90000,
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
