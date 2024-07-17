import { clientV2 } from "./../../common";
import { StakingPoolClientV2 } from "../../../src";

// yarn tsx examples/v2/staking-pool/fetch-all.ts > fetch-all-staking-pool.txt 2>&1
export async function fetchAll() {
  const all = await StakingPoolClientV2.all(clientV2);
  console.log("all.length:", all.length);
  console.log("all:", all);
}

fetchAll();
