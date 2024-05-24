import { PublicKey } from "@solana/web3.js";
import { BoundPoolClient } from "../src/bound-pool/BoundPool";
import { StakingPool } from "../src/staking-pool/StakingPool";
import { client } from "./common/common";

describe.skip("Holders endpoints", () => {
  it("bonding curve", async () => {
    const boundPool = await BoundPoolClient.fromBoundPoolId({
      client,
      poolAccountAddressId: new PublicKey("3oh7S8dMwTwG3fmXD7MAJ75VCyKWQ4ZTmqc6ewZ6fwUu"),
    });

    console.log(await boundPool.getHoldersList());
    console.log(await boundPool.getHoldersCount());
  }, 20000);

  it("live", async () => {
    const poolAddr = new PublicKey("DitzVtU8GKzXaJP5wmiYxEceT4G6PG3SNpbTNUwtParZ");
    const staking = await StakingPool.fromStakingPoolId({
      poolAccountAddressId: poolAddr,
      client,
    });
    const fetchedStaking = await client.memechanProgram.account.stakingPool.fetch(poolAddr);

    console.log(await staking.getHoldersList());
    console.log(await staking.getHoldersCount());
  }, 20000);
});
