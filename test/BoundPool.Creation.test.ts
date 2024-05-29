import { BoundPoolClient } from "../src/bound-pool/BoundPoolClient";
import { DUMMY_TOKEN_METADATA, admin, client, payer } from "./common/common";
import { MEMECHAN_QUOTE_TOKEN } from "../src/config/config";

describe.skip("BoundPoolClient Creation Tests", () => {
  it("creates dummy bound pool", async () => {
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

  it("fails to create bound pool with invalid symbols", async () => {
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

  it("creates bound pool with valid names and symbols", async () => {
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

      console.log("result: " + result);
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

      console.log("result: " + result);
      expect(result).not.toBeNull();
    }
  }, 250000);
});
