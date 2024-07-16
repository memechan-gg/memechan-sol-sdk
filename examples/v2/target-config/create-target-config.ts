/* eslint-disable @typescript-eslint/no-unused-vars */
import BN from "bn.js";
import { getConfig, sleep } from "../../../src";
import { createMemeChanClientV2, payer } from "../../common";
import { TargetConfigClientV2 } from "../../../src/targetconfig/TargetConfigClientV2";

// yarn tsx examples/v2/target-config/create-target-config.ts > create-target-config.txt 2>&1
export const createTargetConfig = async () => {
  const { TOKEN_INFOS } = await getConfig();
  const mint = TOKEN_INFOS.WSOL.mint;

  // const targetAmountRaw = 40_000;
  // const targetAmountRaw = 400;
  const targetAmountRaw = 1;
  const targetAmountBN = new BN(targetAmountRaw * 10 ** TOKEN_INFOS.WSOL.decimals);

  console.log("targetconfig mint: " + mint.toString());

  console.log("payer: " + payer.publicKey.toString());

  const clientV2 = await createMemeChanClientV2();

  const targetConfig = await TargetConfigClientV2.new({
    payer: payer,
    client: clientV2,
    mint: mint,
    targetAmount: targetAmountBN,
  });
  await sleep(1000);
  console.log("targetconfig id: " + targetConfig.id);
  const info = await TargetConfigClientV2.fetch(clientV2.connection, targetConfig.id);
  console.log(info);
};

createTargetConfig();
