import { client, payer } from "../../common";
import { MintUtils } from "../../../src/token/mintUtils";
import { TOKEN_INFOS } from "../../../src";

// yarn tsx examples/slerf/mint-devnet-slerf.ts > mint.txt 2>&1
export const mintSlerf = async () => {
  console.log("payer: " + payer.publicKey.toString());
  console.log("quote token to mint: " + TOKEN_INFOS.SLERF.mint.toString());

  const mintUtils = new MintUtils(client.connection, payer);

  const getAccount1 = await mintUtils.getOrCreateTokenAccount(TOKEN_INFOS.SLERF.mint, payer, payer.publicKey);
  console.log("getOrCreateTokenAccount getAccount1", getAccount1);

  await mintUtils.mintTo(TOKEN_INFOS.SLERF.mint, getAccount1.address);
};

mintSlerf();
