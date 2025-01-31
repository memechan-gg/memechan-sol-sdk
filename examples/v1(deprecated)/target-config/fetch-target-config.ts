import BigNumber from "bignumber.js";
import { TargetConfig } from "../../../src/schema/codegen/accounts";
import { connection } from "../../common";
import { TOKEN_INFOS } from "../../../src";

// yarn tsx examples/target-config/fetch-target-config.ts > fetch-target-config.txt 2>&1
export const fetchTargetConfig = async () => {
  const targetConfigId = TOKEN_INFOS.WSOL.targetConfig;
  console.log("Fetching targetConfigId: " + targetConfigId.toBase58());

  const targetConfig = await TargetConfig.fetch(connection, targetConfigId);

  if (!targetConfig) {
    throw new Error(`No such target config present ${targetConfigId.toBase58()}`);
  }

  const jsonTargetConfig = targetConfig.toJSON();

  console.debug("jsonTargetConfig.tokenTargetAmount (raw)", jsonTargetConfig.tokenTargetAmount);
  console.debug(
    "jsonTargetConfig.tokenTargetAmount (formatted)",
    new BigNumber(jsonTargetConfig.tokenTargetAmount).div(10 ** TOKEN_INFOS.WSOL.decimals).toString(),
  );
  console.debug("jsonTargetConfig.tokenMint", jsonTargetConfig.tokenMint);
};

fetchTargetConfig();
