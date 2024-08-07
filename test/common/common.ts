import { Connection, Keypair, PublicKey } from "@solana/web3.js";
import { HELIUS_API_URL, IS_TEST_ENV, TEST_USER_SECRET_KEY } from "./env";
import { Wallet } from "@coral-xyz/anchor";
import { MemechanClient } from "../../src/MemechanClient";
import { ADMIN_PUB_KEY, TOKEN_INFOS } from "../../src/config/config";
import { BoundPoolWithBuyMemeArgs, MemeTicketClient } from "../../src";
import { MemechanClientV2 } from "../../src/MemechanClientV2";

export const admin = ADMIN_PUB_KEY;
export const payer = Keypair.fromSecretKey(Buffer.from(JSON.parse(TEST_USER_SECRET_KEY)));
export const wallet = new Wallet(payer);

export let client: MemechanClient;

beforeEach(() => {
  client = createMemechanClient();
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

export function createMemechanClient(): MemechanClient {
  const connection = new Connection("https://rpc1.memechan.xyz/", {
    httpAgent: IS_TEST_ENV ? false : undefined,
    commitment: "confirmed",
    confirmTransactionInitialTimeout: 30000,
  });
  return new MemechanClient({
    wallet,
    connection,
    heliusApiUrl: HELIUS_API_URL,
    simulationKeypair: payer,
  });
}

export function createMemechanClientV2(): MemechanClientV2 {
  const connection = new Connection("https://rpc1.memechan.xyz/", {
    httpAgent: IS_TEST_ENV ? false : undefined,
    commitment: "confirmed",
    confirmTransactionInitialTimeout: 30000,
  });
  return new MemechanClientV2({
    wallet,
    connection,
    heliusApiUrl: HELIUS_API_URL,
    simulationKeypair: payer,
  });
}

export const DEFAULT_BOUND_POOL_WITH_BUY_MEME_ARGS: BoundPoolWithBuyMemeArgs = {
  admin,
  payer,
  client: createMemechanClient(),
  quoteToken: TOKEN_INFOS.WSOL,
  tokenMetadata: DUMMY_TOKEN_METADATA,
  buyMemeTransactionArgs: {
    inputAmount: "10",
    minOutputAmount: "1",
    slippagePercentage: 0,
    user: payer.publicKey,
    memeTicketNumber: MemeTicketClient.TICKET_NUMBER_START,
  },
  targetConfig: TOKEN_INFOS.WSOL.targetConfig,
};
