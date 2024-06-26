import { clientV2 } from "./../../common";
import { PublicKey } from "@solana/web3.js";
import { StakingPoolClientV2 } from "../../../src";

// yarn tsx examples/v2/staking-pool/fetch.ts > fetch.txt 2>&1
export async function fetch() {
  const stakingPool = await StakingPoolClientV2.fromStakingPoolId({
    client: clientV2,
    poolAccountAddressId: new PublicKey("EQUjkMoKSnSxDLmJsVP9XpaRKHd46m4yfjERjCrFoehR"),
  });
  console.log("stakingPool:", stakingPool);
}

fetch();
