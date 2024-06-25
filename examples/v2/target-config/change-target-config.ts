import BN from "bn.js";
import { clientV2, payer } from "../../common";
import { TargetConfigClientV2 } from "../../../src/targetconfig/TargetConfigClientV2";
import { TOKEN_INFOS } from "../../../src";

// yarn tsx examples/v2/target-config/change-target-config.ts > change-target-config.txt 2>&1
export const changeTargetConfig = async () => {
  // const targetConfigAddress = MEMECHAN_TARGET_CONFIG;
  const targetConfigAddress = TOKEN_INFOS.WSOL.targetConfigV2;

  const targetConfig = await TargetConfigClientV2.fromTargetConfigId({
    client: clientV2,
    accountAddressId: targetConfigAddress,
  });

  const newTargetAmountRaw = 0.01 * 10 ** TOKEN_INFOS.WSOL.decimals;
  // const newTargetAmountRaw = 400 * 10 ** MEMECHAN_QUOTE_TOKEN_DECIMALS;
  const newTargetAmountBN = new BN(newTargetAmountRaw);

  console.log("original targetConfig: ", targetConfig.tokenTargetAmount.toString());
  console.log("new targetConfig: ", newTargetAmountBN.toString());

  const signature = await targetConfig.changeTargetConfig(newTargetAmountBN, payer);
  console.log("signature: ", signature);
};

changeTargetConfig();
