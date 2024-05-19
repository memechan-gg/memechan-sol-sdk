import { TargetConfig } from "../src/targetconfig/TargetConfig";
import { sleep } from "../src/common/helpers";
import { client, payer } from "./common/common";
import { MintUtils } from "../src/token/mintUtils";
import BN from "bn.js";

describe("TargetConfig", () => {
  it("creates target config", async () => {

    const mintUtils = new MintUtils(client.connection, payer);
    const mint = await mintUtils.createMint(6);

    const targetConfig = await TargetConfig.new({
      payer: payer,
      client,
      mint: mint,
      targetAmount: new BN(1000000000),
    });
    await sleep(1000);
    const info = await targetConfig.fetch();
    console.log(info);
  }, 90000);
});