import { PublicKey } from "@solana/web3.js";
import BigNumber from "bignumber.js";
import { StakingPoolClientV2 } from "../../../src";
import { createMemeChanClientV2 } from "../../common";

// yarn tsx examples/v2/staking-pool/get-holders.ts > get-holders.txt 2>&1
export async function getHolders() {
  const clientV2 = await createMemeChanClientV2();

  const stakingPool = await StakingPoolClientV2.fromStakingPoolId({
    client: clientV2,
    poolAccountAddressId: new PublicKey("EQUjkMoKSnSxDLmJsVP9XpaRKHd46m4yfjERjCrFoehR"),
  });
  console.log("stakingPool:", stakingPool);

  const [hl, staking] = await stakingPool.getHoldersList();

  console.log("holders.length: ", hl.length);
  console.log("non 0 holders.length: ", hl.filter((p) => p.tokenAmount > new BigNumber(0)).length);

  // hl.forEach((e) => console.log(e.address, e.tokenAmount.toString(), e.tokenAmountInPercentage.toString()));
  console.log(staking.address, staking.amount.toString());
}

getHolders();
