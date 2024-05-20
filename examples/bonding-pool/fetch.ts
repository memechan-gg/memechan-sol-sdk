import { PublicKey } from "@solana/web3.js";
import { BoundPool } from "../../src/schema/codegen/accounts";
import { connection } from "../common";

// yarn tsc examples/bonding-pool/fetch.ts > log.txt 2>&1
export async function fetch() {
  const poolAddress = new PublicKey("2qmGVnPQFZ23qUpG5QLiCFupwpXBBAESDTVdn2znkKdA");
  const pool = await BoundPool.fetch(connection, poolAddress);
  console.log("pool:", pool);
}

fetch();
