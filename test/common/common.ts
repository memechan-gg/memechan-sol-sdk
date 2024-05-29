import { Connection, Keypair, PublicKey } from "@solana/web3.js";
import { HELIUS_API_URL, IS_TEST_ENV, TEST_USER_SECRET_KEY } from "./env";
import { Wallet } from "@coral-xyz/anchor";
import { MemechanClient } from "../../src/MemechanClient";
import { ADMIN_PUB_KEY } from "../../src/config/config";
import { getRandomRpcEndpoint } from "../../src/util/getRandomRpcEndpoint";

export const admin = ADMIN_PUB_KEY;
export const payer = Keypair.fromSecretKey(Buffer.from(JSON.parse(TEST_USER_SECRET_KEY)));
export const wallet = new Wallet(payer);
export const connection = new Connection(getRandomRpcEndpoint(), {
  httpAgent: IS_TEST_ENV ? false : undefined,
  commitment: "confirmed",
  confirmTransactionInitialTimeout: 90000,
});

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

export const LIVE_BOUND_POOL_ID = new PublicKey("9pEBW3vNF7uxaPyJbATK1AdCLSxAzJyXs5bPCbuyRHhB");

export const STAKING_POOL_ID = new PublicKey("AAJypjQCKkjkoTjSrM1rd2EEQNhbF27ZSseGJaiiVsRY");
export const MARKET_ID = new PublicKey("3jSj3riY7c5HBCLAyZGRBPjk2Gq5weEMkx1sBYLwRtTf");
export const MEME_MINT = new PublicKey("HjB3RLZYCKSW5mTfxLPtoWERA7GpQg9AZ4ozKshXHrYg");
