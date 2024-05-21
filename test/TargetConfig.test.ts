import { TargetConfig } from "../src/targetconfig/TargetConfig";
import { sleep } from "../src/common/helpers";
import { client, payer } from "./common/common";
import BN from "bn.js";
import { MEMECHAN_MEME_TOKEN_DECIMALS, MEMECHAN_QUOTE_TOKEN, MEMECHAN_TARGET_CONFIG } from "../src/config/config";
import { MintUtils } from "../src/token/mintUtils";

describe("TargetConfig", () => {
  it.skip("creates target config", async () => {

    const mintUtils = new MintUtils(client.connection, payer);
    const mint = await mintUtils.createMint(MEMECHAN_MEME_TOKEN_DECIMALS);

    //const mint = MEMECHAN_QUOTE_TOKEN.mint;

    console.log("targetconfig mint: " + mint.toString());

    const targetConfig = await TargetConfig.new({
      payer: payer,
      client,
      mint: mint,
      targetAmount: new BN(1000000000),
    });
    await sleep(1000);
    console.log("targetconfig id: " + targetConfig.id);
    const info = await targetConfig.fetch();
    console.log(info);
  }, 90000);
  it("change_target_config", async () => {
    
    const targetConfig = await TargetConfig.fromTargetConfigId({client, accountAddressId: MEMECHAN_TARGET_CONFIG});
    await targetConfig.changeTargetConfig(new BN(2000000000));

    const targetConfig2 = await TargetConfig.fromTargetConfigId({client, accountAddressId: MEMECHAN_TARGET_CONFIG});
    console.log("targetConfig2: ", targetConfig2);
  })
});