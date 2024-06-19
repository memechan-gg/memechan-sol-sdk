import { BoundPoolClient } from "../src/bound-pool/BoundPoolClient";
import { DEFAULT_BOUND_POOL_WITH_BUY_MEME_ARGS, DUMMY_TOKEN_METADATA, admin, client, payer } from "./common/common";

export function test() {
  describe("BoundPoolClient Creation Tests", () => {
    it("creates bound pool with buy tx", async () => {
      const outputAmount = await BoundPoolClient.getOutputAmountForNewPoolWithBuyMemeTx(
        DEFAULT_BOUND_POOL_WITH_BUY_MEME_ARGS,
      );
      console.log("==== meme outputAmount: " + outputAmount.toString());

      const boundPool = await BoundPoolClient.newWithBuyTx(DEFAULT_BOUND_POOL_WITH_BUY_MEME_ARGS);
      console.log("==== pool id: " + boundPool.id.toString());
      const info = await BoundPoolClient.fetch2(client.connection, boundPool.id);
      console.log(info);
    }, 150000);

    it("fails to create bound pool with invalid names", async () => {
      const invalidNames = [
        "ThisNameIsWayTooLongToBeValidAndShouldFail", // Exceeds 32 characters
      ];

      for (const invalidName of invalidNames) {
        console.log("invalidName: " + invalidName);
        const metadata = {
          ...DUMMY_TOKEN_METADATA,
          name: invalidName,
        };

        const args = {
          ...DEFAULT_BOUND_POOL_WITH_BUY_MEME_ARGS,
          tokenMetadata: metadata,
        };

        await expect(BoundPoolClient.newWithBuyTx(args)).rejects.toThrow();
      }
    }, 150000);

    it("fails to create bound pool with invalid symbols", async () => {
      const invalidSymbols = [
        "TOOLONGSYMBOL", // Exceeds 10 characters
      ];

      for (const invalidSymbol of invalidSymbols) {
        const metadata = {
          ...DUMMY_TOKEN_METADATA,
          symbol: invalidSymbol,
        };

        const args = {
          ...DEFAULT_BOUND_POOL_WITH_BUY_MEME_ARGS,
          tokenMetadata: metadata,
        };

        await expect(BoundPoolClient.newWithBuyTx(args)).rejects.toThrow();
      }
    }, 150000);

    it("creates bound pool with valid names and symbols", async () => {
      const validNames = ["Valid@Name !123 őá", ""];
      const validSymbols = ["V4L! dS%M", ""];

      for (const name of validNames) {
        const metadata = {
          ...DUMMY_TOKEN_METADATA,
          name: name,
          symbol: validSymbols[0],
        };
        const args = {
          ...DEFAULT_BOUND_POOL_WITH_BUY_MEME_ARGS,
          tokenMetadata: metadata,
        };

        const result = await BoundPoolClient.newWithBuyTx(args);

        console.log("result: " + result.toString());
        expect(result).not.toBeNull();
      }

      for (const symbol of validSymbols) {
        const metadata = {
          ...DUMMY_TOKEN_METADATA,
          name: validNames[0],
          symbol: symbol,
        };

        const result = await BoundPoolClient.new({
          admin,
          payer,
          client,
          quoteToken: DEFAULT_BOUND_POOL_WITH_BUY_MEME_ARGS.quoteToken,
          tokenMetadata: metadata,
        });

        console.log("result: " + result.id.toString());
        expect(result).not.toBeNull();
      }
    }, 250000);
  });
}
