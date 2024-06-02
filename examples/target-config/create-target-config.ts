import BN from "bn.js";
import { TargetConfigClient, sleep } from "../../src";
import {
  MEMECHAN_MEME_TOKEN_DECIMALS,
  MEMECHAN_QUOTE_TOKEN,
  MEMECHAN_QUOTE_TOKEN_DECIMALS,
  MEMECHAN_TARGET_CONFIG,
  SLERF_MINT,
} from "../../src/config/config";
import { MintUtils } from "../../src/token/mintUtils";
import { client, payer } from "../common";

// yarn tsx examples/target-config/create-target-config.ts > create-target-config.txt 2>&1
export const createTargetConfig = async () => {
  // const mintUtils = new MintUtils(client.connection, payer);
  // const mint = await mintUtils.createMint(MEMECHAN_MEME_TOKEN_DECIMALS);

  // const mint = MEMECHAN_QUOTE_TOKEN.mint; // fake slerf
  const mint = SLERF_MINT;

  // const targetAmountRaw = 40_000;
  const targetAmountRaw = 400;
  const targetAmountBN = new BN(targetAmountRaw * 10 ** MEMECHAN_QUOTE_TOKEN_DECIMALS);

  console.log("targetconfig mint: " + mint.toString());

  const targetConfig = await TargetConfigClient.new({
    payer: payer,
    client,
    mint: mint,
    targetAmount: targetAmountBN,
  });
  await sleep(1000);
  console.log("targetconfig id: " + targetConfig.id);
  const info = await TargetConfigClient.fetch(client.connection, targetConfig.id);
  console.log(info);
};

createTargetConfig();
