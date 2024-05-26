import { client } from "../common";
import { StakingPoolClient } from "../../src";

// yarn tsx examples/staking-pool/fetch-all.ts > fetch-all-staking-pool.txt 2>&1
export async function fetchAll() {
  const all = await StakingPoolClient.all(client.memechanProgram);
  console.log("all.length:", all.length);
  console.log("all:", all);
}

fetchAll();
