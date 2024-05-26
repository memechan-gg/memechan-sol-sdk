import { PublicKey } from "@solana/web3.js";
import { BoundPoolClient } from "../src/bound-pool/BoundPoolClient";
import { StakingPoolClient } from "../src/staking-pool/StakingPoolClient";
import { client } from "./common/common";

describe("Holders endpoints", () => {
  it.skip("bonding curve", async () => {
    const boundPool = await BoundPoolClient.fromBoundPoolId({
      client,
      poolAccountAddressId: new PublicKey("Ax8YzJQwwjmzumRqmAfLf742GGKdzx69koVSjer2c396"),
    });

    console.log(await boundPool.getHoldersList());
    console.log(await boundPool.getHoldersCount());
  }, 20000);

  it("live", async () => {
    const poolAddr = new PublicKey("9NMFRVkDQgQW1gskk2oX3XgbtZaY3YF5T1caL1TEzuce");
    const staking = await StakingPoolClient.fromStakingPoolId({
      poolAccountAddressId: poolAddr,
      client,
    });
    const fetchedStaking = await client.memechanProgram.account.stakingPool.fetch(poolAddr);

    const [holderList, locked] = await staking.getHoldersList();
    holderList.forEach((element) => {
      console.log(element.address, element.tokenAmount.toString(), element.tokenAmountInPercentage.toString());
    });
    console.log(locked.address, locked.amount.toString());
    console.log(await staking.getHoldersCount());
  }, 20000);
});
