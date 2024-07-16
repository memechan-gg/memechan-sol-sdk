import BN from "bn.js";
import { getConfig, TargetConfigClient } from "../../src";
import { createMemeChanClient, payer } from "../common";
import { PublicKey } from "@solana/web3.js";

// yarn tsx examples/target-config/change-target-config.ts > change-target-config.txt 2>&1
export const changeTargetConfig = async () => {
  // const targetConfigAddress = MEMECHAN_TARGET_CONFIG;
  const targetConfigAddress = new PublicKey("5g13tz8GKWySjtzPRARuzzQM7LbMCUBMPGPef5PKe4JJ");
  const client = await createMemeChanClient();
  const { TOKEN_INFOS } = await getConfig();
  const targetConfig = await TargetConfigClient.fromTargetConfigId({
    client,
    accountAddressId: targetConfigAddress,
  });

  const newTargetAmountRaw = 40000 * 10 ** TOKEN_INFOS.WSOL.decimals;
  // const newTargetAmountRaw = 400 * 10 ** MEMECHAN_QUOTE_TOKEN_DECIMALS;
  const newTargetAmountBN = new BN(newTargetAmountRaw);

  console.log("original targetConfig: ", targetConfig.tokenTargetAmount.toString());
  console.log("new targetConfig: ", newTargetAmountBN.toString());

  const signature = await targetConfig.changeTargetConfig(newTargetAmountBN, payer);
  console.log("signature: ", signature);
};

changeTargetConfig();
