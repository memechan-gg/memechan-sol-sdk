import { StakingPoolClient } from "../../src";
import { createMemeChanClient } from "../common";

// yarn tsx examples/staking-pool/fetch-all.ts > fetch-all-staking-pool.txt 2>&1
export async function fetchAll() {
  const client = await createMemeChanClient();

  const all = await StakingPoolClient.all(client);
  console.log("all.length:", all.length);
  console.log("all:", all);
}

fetchAll();
