import { StakingPoolClient } from "../../src";
import { PublicKey } from "@solana/web3.js";
import { createMemeChanClient } from "../common";

// yarn tsx examples/staking-pool/fetch.ts > fetch.txt 2>&1
export async function fetch() {
  const client = await createMemeChanClient();

  const stakingPool = await StakingPoolClient.fromStakingPoolId({
    client,
    poolAccountAddressId: new PublicKey("EWuDJ1xifbipiDRm5mwgoGEwY4qFH6ApFT6PMet98Qfc"),
  });
  console.log("stakingPool:", stakingPool);
}

fetch();
