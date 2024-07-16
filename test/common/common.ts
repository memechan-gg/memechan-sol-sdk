import { Keypair, PublicKey } from "@solana/web3.js";
import { TEST_USER_SECRET_KEY } from "./env";
import { Wallet } from "@coral-xyz/anchor";
import { DEFAULT_ON_CHAIN_ADDRESS } from "../../src/config/consts";

export const admin = DEFAULT_ON_CHAIN_ADDRESS; // TODO
export const payer = Keypair.fromSecretKey(Buffer.from(JSON.parse(TEST_USER_SECRET_KEY)));
export const wallet = new Wallet(payer);

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
