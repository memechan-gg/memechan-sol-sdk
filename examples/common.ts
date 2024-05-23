import NodeWallet from "@coral-xyz/anchor/dist/esm/nodewallet";
import { Connection, Keypair, PublicKey } from "@solana/web3.js";
import { MemechanClient } from "../src";
import {
  ADMIN_PUB_KEY,
  HELIUS_API_URL,
  IS_TEST_ENV,
  RPC_API_CLUSTER,
  TEST_USER_SECRET_KEY,
  WSS_API_CLUSTER,
} from "./env";

export const connection = new Connection(RPC_API_CLUSTER);
export const admin = new PublicKey(ADMIN_PUB_KEY);
export const payer = Keypair.fromSecretKey(Buffer.from(JSON.parse(TEST_USER_SECRET_KEY)));
export const wallet = new NodeWallet(payer);
export const client = new MemechanClient({
  wallet,
  heliusApiUrl: HELIUS_API_URL,
  rpcApiUrl: RPC_API_CLUSTER,
  wssApiUrl: WSS_API_CLUSTER,
  isTest: IS_TEST_ENV,
});

export const DUMMY_TOKEN_METADATA = {
  name: "Best Token Ever",
  symbol: "BTE",
  image: "https://cf-ipfs.com/ipfs/QmVevMfxFpfgBu5kHuYUPmDMaV6pWkAn3zw5XaCXxKdaBh",
  description: "This is the best token ever",
  twitter: "https://twitter.com/BestTokenEver",
  telegram: "https://t.me/BestTokenEver",
  website: "https://besttokenever.com",
};
