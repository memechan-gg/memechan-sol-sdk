import { StakingPool } from "../src/staking-pool/StakingPool";
import { client } from "./common/common";

describe("StakingPool", () => {
  it("all", async () => {
    const all = await StakingPool.all(client.memechanProgram);

    for (const pool of all) {
      //console.log(JSON.stringify(pool.account));
      //console.log("==================================================");
    }
  }, 30000);
});
