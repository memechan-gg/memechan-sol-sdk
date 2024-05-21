import { client, payer } from "./common/common";
import { MEMECHAN_QUOTE_TOKEN } from "../src/config/config";
import { MintUtils } from "../src/token/mintUtils";

describe("QUOTE TOKEN MINT", () => {
  it.skip("airdrop quote token", async () => {

    console.log("payer: " + payer.publicKey.toString());
    console.log("quote token mint: " + MEMECHAN_QUOTE_TOKEN.mint.toString());

    const mintUtils = new MintUtils(client.connection, payer);

    const getAccount1 = await mintUtils.getOrCreateTokenAccount(MEMECHAN_QUOTE_TOKEN.mint, payer, payer.publicKey );
    console.log("getOrCreateTokenAccount getAccount1", getAccount1);

    await mintUtils.mintTo(MEMECHAN_QUOTE_TOKEN.mint, getAccount1.address);

    const getAccount2 = await mintUtils.getOrCreateTokenAccount(MEMECHAN_QUOTE_TOKEN.mint, payer, payer.publicKey );
    console.log("getOrCreateTokenAccount getAccount2", getAccount2);

  }, 90000);
});