import { PublicKey } from "@solana/web3.js";
import { StakingPoolClientV2 } from "../../../src";
import { createMemeChanClientV2 } from "../../common";

// yarn tsx examples/v2/staking-pool/fetch.ts > fetch.txt 2>&1
export async function fetch() {
  const clientV2 = await createMemeChanClientV2();

  const stakingPool = await StakingPoolClientV2.fromStakingPoolId({
    client: clientV2,
    poolAccountAddressId: new PublicKey("BdJgoZcnGVEoH9zkudujF33oXZbzFbYVQpwtVznfkV87"),
  });
  console.log("stakingPool:", stakingPool);
}

fetch();
