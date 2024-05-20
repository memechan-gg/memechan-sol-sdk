import { Keypair, PublicKey } from "@solana/web3.js";
import { ADMIN_PUB_KEY, IS_TEST_ENV, RPC_API_CLUSTER, TEST_USER_SECRET_KEY, WSS_API_CLUSTER } from "./env";
import NodeWallet from "@coral-xyz/anchor/dist/cjs/nodewallet";
import { MemechanClient } from "../../src/MemechanClient";

export const admin = new PublicKey(ADMIN_PUB_KEY);
export const payer = Keypair.fromSecretKey(Buffer.from(JSON.parse(TEST_USER_SECRET_KEY)));
export const wallet = new NodeWallet(payer);
export const client = new MemechanClient({
  wallet,
  rpcApiUrl: RPC_API_CLUSTER,
  wssApiUrl: WSS_API_CLUSTER,
  isTest: IS_TEST_ENV,
});
