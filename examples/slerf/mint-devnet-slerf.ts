import { MEMECHAN_QUOTE_TOKEN } from "../../src/config/config";
import { client, payer } from "../common";
import { MintUtils } from "../../src/token/mintUtils";

// yarn tsx examples/slerf/mint-devnet-slerf.ts > mint.txt 2>&1
export const mintSlerf = async () => {
    console.log("payer: " + payer.publicKey.toString());
    console.log("quote token to mint: " + MEMECHAN_QUOTE_TOKEN.mint.toString());

    const mintUtils = new MintUtils(client.connection, payer);

    const getAccount1 = await mintUtils.getOrCreateTokenAccount(MEMECHAN_QUOTE_TOKEN.mint, payer, payer.publicKey );
    console.log("getOrCreateTokenAccount getAccount1", getAccount1);

    await mintUtils.mintTo(MEMECHAN_QUOTE_TOKEN.mint, getAccount1.address);
};

mintSlerf();