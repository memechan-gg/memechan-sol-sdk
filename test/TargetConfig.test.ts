import BN from "bn.js";
import { sleep } from "../src/common/helpers";
import { TargetConfigClient } from "../src/targetconfig/TargetConfigClient";
import { MintUtils } from "../src/token/mintUtils";
import { client, payer } from "./common/common";
import { TOKEN_INFOS } from "../src";

export function test() {
  describe("TargetConfigClient", () => {
    it.skip("creates target config", async () => {
      const mintUtils = new MintUtils(client.connection, payer);
      // const mint = await mintUtils.createMint(MEMECHAN_MEME_TOKEN_DECIMALS);

      const mint = TOKEN_INFOS.WSOL.mint;

      console.log("targetconfig mint: " + mint.toString());

      const targetConfig = await TargetConfigClient.new({
        payer: payer,
        client,
        mint: mint,
        targetAmount: new BN(40000 * 1e9),
      });
      await sleep(1000);
      console.log("targetconfig id: " + targetConfig.id);
      const info = await TargetConfigClient.fetch(client.connection, targetConfig.id);
      console.log(info);
    }, 90000);
    it("change_target_config", async () => {
      const targetConfig = await TargetConfigClient.fromTargetConfigId({
        client,
        accountAddressId: TOKEN_INFOS.WSOL.targetConfig,
      });

      console.log("original targetConfig: ", targetConfig.tokenTargetAmount);
      await targetConfig.changeTargetConfig(new BN(40000 * 1e9), payer);
    }, 20000);
  });
}
