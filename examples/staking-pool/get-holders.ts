import { client } from "../common";
import { StakingPoolClient } from "../../src";
import { PublicKey } from "@solana/web3.js";

// yarn tsx examples/staking-pool/get-holders.ts
export async function fetch() {
  const stakingPool = await StakingPoolClient.fromStakingPoolId({
    client,
    poolAccountAddressId: new PublicKey("7pt2VQv1h6VqHmFgm1R2xgAusvkzqPbabUGYdZRytkcs"),
  });
  console.log("stakingPool:", stakingPool);
  const [hl, staking] = await stakingPool.getHoldersList();
  hl.forEach((e) => console.log(e.address, e.tokenAmount.toString(), e.tokenAmountInPercentage.toString()));
  console.log(staking.address, staking.amount.toString());
}

fetch();
