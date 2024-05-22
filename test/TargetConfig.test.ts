import { TargetConfig } from "../src/targetconfig/TargetConfig";
import { sleep } from "../src/common/helpers";
import { client, payer } from "./common/common";
import BN from "bn.js";
import { MintUtils } from "../src/token/mintUtils";
import { MEMECHAN_MEME_TOKEN_DECIMALS, MEMECHAN_QUOTE_TOKEN, MEMECHAN_TARGET_CONFIG } from "../src/config/config";

describe("TargetConfig", () => {
  it.skip("creates target config", async () => {
    const mintUtils = new MintUtils(client.connection, payer);
    //const mint = await mintUtils.createMint(MEMECHAN_MEME_TOKEN_DECIMALS);

    const mint = MEMECHAN_QUOTE_TOKEN.mint;

    console.log("targetconfig mint: " + mint.toString());

    const targetConfig = await TargetConfig.new({
      payer: payer,
      client,
      mint: mint,
      targetAmount: new BN(40000 * 1e9),
    });
    await sleep(1000);
    console.log("targetconfig id: " + targetConfig.id);
    const info = await TargetConfig.fetch(client.connection, targetConfig.id);
    console.log(info);
  }, 90000);
  it("change_target_config", async () => {
    const targetConfig = await TargetConfig.fromTargetConfigId({ client, accountAddressId: MEMECHAN_TARGET_CONFIG });

    console.log("original targetConfig: ", targetConfig.tokenTargetAmount);
    await targetConfig.changeTargetConfig(new BN(40000 * 1e9), payer);
  }, 20000);
});
