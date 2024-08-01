import { client } from "../../common";
import { StakingPoolClient } from "../../../src";
import { PublicKey } from "@solana/web3.js";
import BigNumber from "bignumber.js";

// yarn tsx examples/staking-pool/get-holders.ts > get-holders.txt 2>&1
export async function getHolders() {
  const stakingPool = await StakingPoolClient.fromStakingPoolId({
    client,
    poolAccountAddressId: new PublicKey("5VonCWEERZdvJZKFGDqCXNoydRCKPRW2CNemYS6cHcUb"),
  });
  console.log("stakingPool:", stakingPool);

  const [hl, staking] = await stakingPool.getHoldersList();

  console.log("holders.length: ", hl.length);
  console.log("non 0 holders.length: ", hl.filter((p) => p.tokenAmount > new BigNumber(0)).length);

  // hl.forEach((e) => console.log(e.address, e.tokenAmount.toString(), e.tokenAmountInPercentage.toString()));
  console.log(staking.address, staking.amount.toString());
}

getHolders();
