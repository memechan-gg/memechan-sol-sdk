import { Wallet } from "@coral-xyz/anchor";
import { Connection, FetchMiddleware, Keypair } from "@solana/web3.js";
import { HELIUS_API_KEY, HELIUS_API_URL, IS_TEST_ENV, TEST_USER_SECRET_KEY } from "./env";
import { HeliusApi } from "../src/helius-api/HeliusApi";
import { MemechanClientV2 } from "../src/MemechanClientV2";
import { getConfig, MemechanClient } from "../src";

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

export const payer = Keypair.fromSecretKey(Buffer.from(JSON.parse(TEST_USER_SECRET_KEY)));
export const wallet = new Wallet(payer);

export async function createMemeChanClient() {
  const { MEMECHAN_PROGRAM_ID } = await getConfig();

  return new MemechanClient({
    wallet,
    heliusApiUrl: HELIUS_API_URL,
    connection,
    simulationKeypair: payer,
    memeChanProgramId: MEMECHAN_PROGRAM_ID,
  });
}

export async function createMemeChanClientV2() {
  const { MEMECHAN_PROGRAM_ID_V2 } = await getConfig();

  return new MemechanClientV2({
    wallet,
    heliusApiUrl: HELIUS_API_URL,
    connection,
    simulationKeypair: payer,
    memeChanProgramId: MEMECHAN_PROGRAM_ID_V2,
  });
}

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

export const HeliusApiInstance = new HeliusApi(HELIUS_API_URL, HELIUS_API_KEY);
