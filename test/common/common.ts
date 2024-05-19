import { Keypair, PublicKey } from "@solana/web3.js";
import { ADMIN_PUB_KEY, IS_TEST_ENV, RPC_API_CLUSTER, TEST_USER_SECRET_KEY, WSS_API_CLUSTER } from "./env";
import NodeWallet from "@coral-xyz/anchor/dist/cjs/nodewallet";
import { MemechanClient } from "../../src/MemechanClient";
import { MEMECHAN_PROGRAM_ID } from "../../src/config/config";

export const admin = new PublicKey(ADMIN_PUB_KEY);
export const payer = Keypair.fromSecretKey(Buffer.from(JSON.parse(TEST_USER_SECRET_KEY)));
export const wallet = new NodeWallet(payer);
export const client = new MemechanClient(
  wallet,
  {},
  RPC_API_CLUSTER,
  WSS_API_CLUSTER,
  MEMECHAN_PROGRAM_ID,
  IS_TEST_ENV,
);
