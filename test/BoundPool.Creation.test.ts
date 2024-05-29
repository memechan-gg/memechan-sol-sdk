import { BoundPoolClient } from "../src/bound-pool/BoundPoolClient";
import { DUMMY_TOKEN_METADATA, admin, client, payer } from "./common/common";
import { MEMECHAN_QUOTE_TOKEN } from "../src/config/config";

describe("BoundPoolClient Creation Tests", () => {
  it.skip("creates dummy bound pool", async () => {
    const boundPool = await BoundPoolClient.new({
      admin,
      payer,
      client,
      quoteToken: MEMECHAN_QUOTE_TOKEN,
      tokenMetadata: DUMMY_TOKEN_METADATA,
    });
    console.log("==== pool id: " + boundPool.id.toString());
    const info = await BoundPoolClient.fetch2(client.connection, boundPool.id);
    console.log(info);
  }, 150000);

  it("creates bound pool with buy tx", async () => {
    const args = {
      admin,
      payer,
      client,
      quoteToken: MEMECHAN_QUOTE_TOKEN,
      tokenMetadata: DUMMY_TOKEN_METADATA,
      buyMemeTransactionArgs: {
        inputAmount: "10",
        minOutputAmount: "1",
        slippagePercentage: 0,
        user: payer.publicKey,
      },
    };

    const outputAmount = await BoundPoolClient.getOutputAmountForNewPoolWithBuyMemeTx(args);
    console.log("==== meme outputAmount: " + outputAmount.toString());

    const boundPool = await BoundPoolClient.newWithBuyTx(args);
    console.log("==== pool id: " + boundPool.id.toString());
    const info = await BoundPoolClient.fetch2(client.connection, boundPool.id);
    console.log(info);
  }, 150000);

  it.skip("fails to create bound pool with invalid names", async () => {
    const invalidNames = [
      "ThisNameIsWayTooLongToBeValidAndShouldFail", // Exceeds 32 characters
    ];

    for (const invalidName of invalidNames) {
      console.log("invalidName: " + invalidName);
      const metadata = {
        ...DUMMY_TOKEN_METADATA,
        name: invalidName,
      };

      await expect(
        BoundPoolClient.new({
          admin,
          payer,
          client,
          quoteToken: MEMECHAN_QUOTE_TOKEN,
          tokenMetadata: metadata,
        }),
      ).rejects.toThrow();
    }
  }, 150000);

  it.skip("fails to create bound pool with invalid symbols", async () => {
    const invalidSymbols = [
      "TOOLONGSYMBOL", // Exceeds 10 characters
    ];

    for (const invalidSymbol of invalidSymbols) {
      const metadata = {
        ...DUMMY_TOKEN_METADATA,
        symbol: invalidSymbol,
      };

      await expect(
        BoundPoolClient.new({
          admin,
          payer,
          client,
          quoteToken: MEMECHAN_QUOTE_TOKEN,
          tokenMetadata: metadata,
        }),
      ).rejects.toThrow();
    }
  }, 150000);

  it.skip("creates bound pool with valid names and symbols", async () => {
    const validNames = ["Valid@Name !123 őá", ""];
    const validSymbols = ["V4L! dS%M", ""];

    for (const name of validNames) {
      const metadata = {
        ...DUMMY_TOKEN_METADATA,
        name: name,
        symbol: validSymbols[0],
      };

      const result = await BoundPoolClient.new({
        admin,
        payer,
        client,
        quoteToken: MEMECHAN_QUOTE_TOKEN,
        tokenMetadata: metadata,
      });

      console.log("result: " + result.id.toString());
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
        quoteToken: MEMECHAN_QUOTE_TOKEN,
        tokenMetadata: metadata,
      });

      console.log("result: " + result.id.toString());
      expect(result).not.toBeNull();
    }
  }, 250000);
});
