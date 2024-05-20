import { PublicKey } from "@solana/web3.js";
import { BoundPool } from "../../src/bound-pool/BoundPool";
import { connection } from "../common";

// yarn tsx examples/bonding-pool/fetch.ts > log.txt 2>&1
export async function fetch() {
  const poolAddress = new PublicKey("GFC6FrfkSP12k5h31Cs7zfpBAaspnAfmYdciS5Pfwt2J");
  const pool = await BoundPool.fetch(connection, poolAddress);
  console.log("pool:", pool);
}

fetch();
