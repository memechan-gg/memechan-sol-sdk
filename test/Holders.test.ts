import { PublicKey } from "@solana/web3.js";
import { BoundPoolClient } from "../src/bound-pool/BoundPool";
import { admin, client, payer } from "./common/common";
import { MEMECHAN_QUOTE_TOKEN } from "../src/config/config";
import BN from "bn.js";
import { sleep } from "../src/common/helpers";
import { StakingPool } from "../src/staking-pool/StakingPool";
import { FEE_DESTINATION_ID } from "./common/env";

const DUMMY_TOKEN_METADATA = {
  name: "Best Token Ever",
  symbol: "BTE",
  image: "https://cf-ipfs.com/ipfs/QmVevMfxFpfgBu5kHuYUPmDMaV6pWkAn3zw5XaCXxKdaBh",
  description: "This is the best token ever",
  twitter: "https://twitter.com/BestTokenEver",
  telegram: "https://t.me/BestTokenEver",
  website: "https://besttokenever.com",
};

describe("Holders endpoints", () => {
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
