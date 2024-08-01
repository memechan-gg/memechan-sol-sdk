import { BoundPoolClient } from "../../src/bound-pool/BoundPoolClient";
import { client } from "../common";

// yarn tsx examples/bonding-pool/fetch-all.ts > fetch-all-bonding-pool.txt 2>&1
export async function fetchAll() {
  const all = await BoundPoolClient.all(client.memechanProgram);
  console.log("all.length:", all.length);
  console.log("all ids & locked:", all.map((pool) => ({
    publicKey: pool.publicKey.toString(),
    locked: pool.account.locked.toString()
  })));
}

fetchAll();
