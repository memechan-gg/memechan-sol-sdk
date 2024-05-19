import { TargetConfig } from "../src/targetconfig/TargetConfig";
import { sleep } from "../src/common/helpers";
import { client, payer } from "./common/common";
import { NATIVE_MINT } from "@solana/spl-token";

describe("TargetConfig", () => {
  it.skip("creates target config", async () => {

    const targetConfig = await TargetConfig.new({
      payer: payer,
      client,
      mint: NATIVE_MINT,
    });
    await sleep(1000);
    const info = await targetConfig.fetch();
    console.log(info);
  }, 90000);
});