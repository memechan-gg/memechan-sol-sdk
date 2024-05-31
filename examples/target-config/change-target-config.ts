import BN from "bn.js";
import { TargetConfigClient } from "../../src";
import { MEMECHAN_TARGET_CONFIG } from "../../src/config/config";
import { client, payer } from "../common";

// yarn tsx examples/target-config/change-target-config.ts > change-target-config.txt 2>&1
export const changeTargetConfig = async () => {
  const targetConfig = await TargetConfigClient.fromTargetConfigId({
    client,
    accountAddressId: MEMECHAN_TARGET_CONFIG,
  });

  console.log("original targetConfig: ", targetConfig.tokenTargetAmount);
  const signature = await targetConfig.changeTargetConfig(new BN(40000 * 1e9), payer);
  console.log("signature: ", signature);
};

changeTargetConfig();
