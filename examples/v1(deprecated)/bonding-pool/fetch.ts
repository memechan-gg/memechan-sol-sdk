import { PublicKey } from "@solana/web3.js";
import { BoundPoolClient } from "../../src/bound-pool/BoundPoolClient";
import { connection } from "../common";

// yarn tsx examples/bonding-pool/fetch.ts > log.txt 2>&1
export async function fetch() {
  const poolAddress = new PublicKey("BZfeYQm5vihZULjyMGmmrrf8raSnZxBN5SpFvReMRP8b");

  const pool = await BoundPoolClient.fetch2(connection, poolAddress);
  console.log("pool:", pool);
}

fetch();
