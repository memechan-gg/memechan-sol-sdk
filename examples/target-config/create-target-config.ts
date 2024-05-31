import BN from "bn.js";
import { TargetConfigClient, sleep } from "../../src";
import {
  MEMECHAN_MEME_TOKEN_DECIMALS,
  MEMECHAN_QUOTE_TOKEN,
  MEMECHAN_QUOTE_TOKEN_DECIMALS,
  MEMECHAN_TARGET_CONFIG,
} from "../../src/config/config";
import { MintUtils } from "../../src/token/mintUtils";
import { client, payer } from "../common";

// yarn tsx examples/target-config/create-target-config.ts > create-target-config.txt 2>&1
export const createTargetConfig = async () => {
  // const mintUtils = new MintUtils(client.connection, payer);
  // const mint = await mintUtils.createMint(MEMECHAN_MEME_TOKEN_DECIMALS);
  const mint = MEMECHAN_QUOTE_TOKEN.mint;

  console.log("targetconfig mint: " + mint.toString());

  const targetConfig = await TargetConfigClient.new({
    payer: payer,
    client,
    mint: mint,
    targetAmount: new BN(40_000 * MEMECHAN_QUOTE_TOKEN_DECIMALS),
  });
  await sleep(1000);
  console.log("targetconfig id: " + targetConfig.id);
  const info = await TargetConfigClient.fetch(client.connection, targetConfig.id);
  console.log(info);
};

createTargetConfig();
