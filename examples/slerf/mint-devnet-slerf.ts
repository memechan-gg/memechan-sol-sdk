import { connection, payer } from "../common";
import { MintUtils } from "../../src/token/mintUtils";
import { getConfig } from "../../src";

// yarn tsx examples/slerf/mint-devnet-slerf.ts > mint.txt 2>&1
export const mintSlerf = async () => {
  console.log("payer: " + payer.publicKey.toString());
  const { TOKEN_INFOS } = await getConfig();

  console.log("quote token to mint: " + TOKEN_INFOS.SLERF.mint.toString());

  const mintUtils = new MintUtils(connection, payer);

  const getAccount1 = await mintUtils.getOrCreateTokenAccount(TOKEN_INFOS.SLERF.mint, payer, payer.publicKey);
  console.log("getOrCreateTokenAccount getAccount1", getAccount1);

  await mintUtils.mintTo(TOKEN_INFOS.SLERF.mint, getAccount1.address);
};

mintSlerf();
