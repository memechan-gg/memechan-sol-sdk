import { client } from "../common";
import { StakingPoolClient } from "../../src";
import { PublicKey } from "@solana/web3.js";

// yarn tsx examples/staking-pool/get-holders.ts > get-holders.txt 2>&1
export async function getHolders() {
  const stakingPool = await StakingPoolClient.fromStakingPoolId({
    client,
    poolAccountAddressId: new PublicKey("sh5hozk6bENHvG4J5zrqW2S5eKjp68DRPZodCRLSkJU"),
  });
  console.log("stakingPool:", stakingPool);

  const [hl, staking] = await stakingPool.getHoldersList();

  hl.forEach((e) => console.log(e.address, e.tokenAmount.toString(), e.tokenAmountInPercentage.toString()));
  console.log(staking.address, staking.amount.toString());
}

getHolders();
