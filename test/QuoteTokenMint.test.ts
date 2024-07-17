import { client, payer } from "./common/common";
import { MintUtils } from "../src/token/mintUtils";
import { TOKEN_INFOS } from "../src";

export function test() {
  describe("QUOTE TOKEN MINT", () => {
    it("airdrop quote token", async () => {
      console.log("payer: " + payer.publicKey.toString());
      console.log("quote token mint: " + TOKEN_INFOS.WSOL.mint.toString());

      const mintUtils = new MintUtils(client.connection, payer);

      const getAccount1 = await mintUtils.getOrCreateTokenAccount(TOKEN_INFOS.WSOL.mint, payer, payer.publicKey);
      console.log("getOrCreateTokenAccount getAccount1", getAccount1);

      await mintUtils.mintTo(TOKEN_INFOS.WSOL.mint, getAccount1.address, BigInt(40000 * 1e9));

      const getAccount2 = await mintUtils.getOrCreateTokenAccount(TOKEN_INFOS.WSOL.mint, payer, payer.publicKey);
      console.log("getOrCreateTokenAccount getAccount2", getAccount2);
    }, 90000);
  });
}
