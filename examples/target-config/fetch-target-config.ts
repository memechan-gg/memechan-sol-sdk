import BigNumber from "bignumber.js";
import { MEMECHAN_QUOTE_TOKEN_DECIMALS, MEMECHAN_TARGET_CONFIG } from "../../src/config/config";
import { TargetConfig } from "../../src/schema/codegen/accounts";
import { connection } from "../common";

// yarn tsx examples/target-config/fetch-target-config.ts > fetch-target-config.txt 2>&1
export const fetchTargetConfig = async () => {
  const targetConfigId = MEMECHAN_TARGET_CONFIG;
  console.log("Fetching targetConfigId: " + targetConfigId.toBase58());

  const targetConfig = await TargetConfig.fetch(connection, targetConfigId);

  if (!targetConfig) {
    throw new Error(`No such target config present ${targetConfigId.toBase58()}`);
  }

  const jsonTargetConfig = targetConfig.toJSON();

  console.debug("jsonTargetConfig.tokenTargetAmount (raw)", jsonTargetConfig.tokenTargetAmount);
  console.debug(
    "jsonTargetConfig.tokenTargetAmount (formatted)",
    new BigNumber(jsonTargetConfig.tokenTargetAmount).div(10 ** MEMECHAN_QUOTE_TOKEN_DECIMALS).toString(),
  );
  console.debug("jsonTargetConfig.tokenMint", jsonTargetConfig.tokenMint);
};

fetchTargetConfig();
