import { BN } from "@coral-xyz/anchor";
import { BoundPoolClient } from "../src/bound-pool/BoundPoolClient";
import { sleep } from "../src/common/helpers";
import { DUMMY_TOKEN_METADATA, admin, client, payer } from "./common/common";
import { FEE_DESTINATION_ID, MEMECHAN_QUOTE_TOKEN } from "../src/config/config";
import { MemeTicketClient } from "../src/memeticket/MemeTicketClient";
import { PublicKey } from "@solana/web3.js";

describe.skip("BoundPool", () => {
  it("creates bound pool", async () => {
    const boundPool = await BoundPoolClient.new({
      admin,
      payer,
      client,
      quoteToken: MEMECHAN_QUOTE_TOKEN,
      tokenMetadata: DUMMY_TOKEN_METADATA,
    });
    const info = await BoundPoolClient.fetch2(client.connection, boundPool.id);
    console.log(info);
  }, 150000);

  it.skip("fails to create bound pool with invalid names", async () => {
    const invalidNames = [
      "ThisNameIsWayTooLongToBeValidAndShouldFail", // Exceeds 32 bytes
    ];

    for (const invalidName of invalidNames) {
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

  it.skip("fails to create bound pool with invalid symbol", async () => {
    const invalidSymbols = [
      "TOOLONGSYMBOL", // Exceeds 10 bytes
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

  it.skip("all", async () => {
    const all = await BoundPoolClient.all(client.memechanProgram);

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    for (const pool of all) {
      // console.log(pool.account);
      // console.log("==================================================");
    }

    console.log(all);
  }, 30000);

  it.skip("swapy, golive, should fail below tresholds", async () => {
    const boundPool = await BoundPoolClient.new({
      admin,
      payer,
      client,
      quoteToken: MEMECHAN_QUOTE_TOKEN,
      tokenMetadata: DUMMY_TOKEN_METADATA,
    });

    console.log("==== pool id: " + boundPool.id.toString() + ", " + new Date().toUTCString());

    const tickets: MemeTicketClient[] = [];

    const ticketId = await boundPool.swapY({
      payer: payer,
      user: payer,
      memeTokensOut: new BN(100 * 1e6),
      quoteAmountIn: new BN(500 * 1e9),
      quoteMint: MEMECHAN_QUOTE_TOKEN.mint,
      pool: boundPool.id,
    });

    tickets.push(new MemeTicketClient(ticketId.id, client));
    console.log("swapY ticketId: " + ticketId.id.toBase58() + ", " + new Date().toUTCString());

    const ticketId2 = await boundPool.swapY({
      payer: payer,
      user: payer,
      memeTokensOut: new BN(100 * 1e6),
      quoteAmountIn: new BN(499 * 1e9),
      quoteMint: MEMECHAN_QUOTE_TOKEN.mint,
      pool: boundPool.id,
    });

    tickets.push(new MemeTicketClient(ticketId2.id, client));
    console.log("swapY ticketId2: " + ticketId2.id.toBase58() + ", " + new Date().toUTCString());

    const boundPoolInfo = await BoundPoolClient.fetch2(client.connection, boundPool.id);

    console.log("boundPoolInfo:", boundPoolInfo);

    // await expect(
    const result = await boundPool.initStakingPool({
      payer: payer,
      user: payer,
      boundPoolInfo,
    });
    // ).rejects.toThrow();

    console.log("initStakingPool result: " + result + ", " + new Date().toUTCString());
  }, 550000);

  it.skip("init staking pool then go live", async () => {
    console.log(" init staking pool then go live. " + new Date().toUTCString());
    console.log("payer: " + payer.publicKey.toString());
    const pool = await BoundPoolClient.new({
      admin,
      payer,
      client,
      quoteToken: MEMECHAN_QUOTE_TOKEN,
      tokenMetadata: DUMMY_TOKEN_METADATA,
    });

    console.log("==== pool id: " + pool.id.toString());

    const ticketId = await pool.swapY({
      payer: payer,
      user: payer,
      memeTokensOut: new BN(1000 * 1e6),
      quoteAmountIn: new BN(100000 * 1e9),
      quoteMint: MEMECHAN_QUOTE_TOKEN.mint,
      pool: pool.id,
    });

    console.log("swapY ticketId: " + ticketId.id.toBase58());

    const boundPoolInfo = await BoundPoolClient.fetch2(client.connection, pool.id);

    console.log("boundPoolInfo:", boundPoolInfo);
    const { stakingMemeVault, stakingQuoteVault } = await pool.initStakingPool({
      payer: payer,
      user: payer,
      boundPoolInfo,
    });

    console.log("stakingMemeVault: " + stakingMemeVault.toString());
    console.log("stakingQuoteVault: " + stakingQuoteVault.toString());

    console.log("golive start. " + new Date().toUTCString());

    const [stakingPool, livePool] = await pool.goLive({
      payer: payer,
      user: payer,
      boundPoolInfo,
      feeDestinationWalletAddress: FEE_DESTINATION_ID,
      memeVault: stakingMemeVault,
      quoteVault: stakingQuoteVault,
    });

    console.log("golive end. " + new Date().toUTCString());

    const ammPool = livePool.ammPoolInfo;
    console.log("ammPool: " + JSON.stringify(ammPool));

    console.log("golive finished. stakingPool: " + stakingPool.id.toString() + " ammPool: " + ammPool.id.toString());
  }, 500000);

  it.skip("init staking pool, many swapy, then go live", async () => {
    console.log(" init staking pool, many swapy then go live. " + new Date().toUTCString());
    console.log("payer: " + payer.publicKey.toString());
    const pool = await BoundPoolClient.new({
      admin,
      payer,
      client,
      quoteToken: MEMECHAN_QUOTE_TOKEN,
      tokenMetadata: DUMMY_TOKEN_METADATA,
    });

    console.log("==== pool id: " + pool.id.toString());

    for (let i = 0; i < 10; i++) {
      const ticketId = await pool.swapY({
        payer: payer,
        user: payer,
        memeTokensOut: new BN(100 * 1e6),
        quoteAmountIn: new BN(41000 * 1e9),
        quoteMint: MEMECHAN_QUOTE_TOKEN.mint,
        pool: pool.id,
      });

      console.log("swapY (" + i + ") ticketId: " + ticketId.id.toBase58());
    }
    const boundPoolInfo = await BoundPoolClient.fetch2(client.connection, pool.id);

    console.log("boundPoolInfo:", boundPoolInfo);
    const { stakingMemeVault, stakingQuoteVault } = await pool.initStakingPool({
      payer: payer,
      user: payer,
      boundPoolInfo,
    });

    console.log("stakingMemeVault: " + stakingMemeVault.toString());
    console.log("stakingQuoteVault: " + stakingQuoteVault.toString());

    console.log("golive start. " + new Date().toUTCString());

    const [stakingPool, livePool] = await pool.goLive({
      payer: payer,
      user: payer,
      boundPoolInfo,
      feeDestinationWalletAddress: FEE_DESTINATION_ID,
      memeVault: stakingMemeVault,
      quoteVault: stakingQuoteVault,
    });

    console.log("golive end. " + new Date().toUTCString());

    const ammPool = livePool.ammPoolInfo;
    console.log("ammPool: " + JSON.stringify(ammPool));

    console.log("golive finished. stakingPool: " + stakingPool.id.toString() + " ammPool: " + ammPool.id.toString());
  }, 1500000);
});

describe.skip("BoundPoolClient Tests 2", () => {
  it("sells meme tokens", async () => {
    const poolAccountAddressId = new PublicKey("FrZBDKqxoNeyLYjLn2KM2nnVRWwpzZvM2i9kUx61xDVA");
    const boundPoolInstance = await BoundPoolClient.fromBoundPoolId({ client, poolAccountAddressId });

    const inputAmount = "567.023231";
    const minOutputAmount = await boundPoolInstance.getOutputAmountForSellMeme({
      inputAmount: inputAmount,
      slippagePercentage: 0,
    });

    console.debug("minOutputAmount: ", minOutputAmount);
    const res = await boundPoolInstance.sellMeme({
      inputAmount: inputAmount,
      minOutputAmount: minOutputAmount,
      slippagePercentage: 0,
      user: payer.publicKey,
      signer: payer,
    });

    expect(res).toBeDefined();
  }, 150000);

  it("buys meme tokens", async () => {
    const poolAccountAddressId = new PublicKey("FrZBDKqxoNeyLYjLn2KM2nnVRWwpzZvM2i9kUx61xDVA");
    const boundPoolInstance = await BoundPoolClient.fromBoundPoolId({ client, poolAccountAddressId });

    const inputAmount = "0.568";
    const minOutputAmount = await boundPoolInstance.getOutputAmountForBuyMeme({
      inputAmount: inputAmount,
      slippagePercentage: 0,
    });

    console.debug("minOutputAmount: ", minOutputAmount);

    const res = await boundPoolInstance.buyMeme({
      inputAmount: inputAmount,
      minOutputAmount: minOutputAmount,
      slippagePercentage: 0,
      user: payer.publicKey,
      signer: payer,
    });

    console.debug("res: ");
    console.dir(res, { depth: null });

    expect(res).toBeDefined();
  }, 150000);

  describe.skip("Edge Cases", () => {
    it("handles zero input amount for sellMeme", async () => {
      const poolAccountAddressId = new PublicKey("FrZBDKqxoNeyLYjLn2KM2nnVRWwpzZvM2i9kUx61xDVA");
      const boundPoolInstance = await BoundPoolClient.fromBoundPoolId({ client, poolAccountAddressId });

      const inputAmount = "0";
      const minOutputAmount = await boundPoolInstance.getOutputAmountForSellMeme({
        inputAmount: inputAmount,
        slippagePercentage: 0,
      });

      await expect(
        boundPoolInstance.sellMeme({
          inputAmount: inputAmount,
          minOutputAmount: minOutputAmount,
          slippagePercentage: 0,
          user: payer.publicKey,
          signer: payer,
        }),
      ).rejects.toThrow();
    }, 150000);

    it("handles negative input amount for buyMeme", async () => {
      const poolAccountAddressId = new PublicKey("FrZBDKqxoNeyLYjLn2KM2nnVRWwpzZvM2i9kUx61xDVA");
      const boundPoolInstance = await BoundPoolClient.fromBoundPoolId({ client, poolAccountAddressId });

      const inputAmount = "-0.568";
      //  await expect(
      const amount = await boundPoolInstance.getOutputAmountForBuyMeme({
        inputAmount: inputAmount,
        slippagePercentage: 0,
      });
      console.log("amount: ", amount);
      // ).rejects.toThrow('Input amount must be a positive number');
    }, 150000);

    it("handles high slippage percentage for sellMeme", async () => {
      const poolAccountAddressId = new PublicKey("FrZBDKqxoNeyLYjLn2KM2nnVRWwpzZvM2i9kUx61xDVA");
      const boundPoolInstance = await BoundPoolClient.fromBoundPoolId({ client, poolAccountAddressId });

      const inputAmount = "567.023231";
      await expect(
        boundPoolInstance.getOutputAmountForSellMeme({
          inputAmount: inputAmount,
          slippagePercentage: 100,
        }),
      ).rejects.toThrow("Slippage percentage must be between 0 (inclusive) and 100 (exclusive).");

      await expect(
        boundPoolInstance.sellMeme({
          inputAmount: inputAmount,
          minOutputAmount: "5",
          slippagePercentage: 100,
          user: payer.publicKey,
          signer: payer,
        }),
      ).rejects.toThrow("Slippage percentage must be between 0 (inclusive) and 100 (exclusive).");
    }, 150000);

    it("too high slippage percentage for sellMeme", async () => {
      const poolAccountAddressId = new PublicKey("FrZBDKqxoNeyLYjLn2KM2nnVRWwpzZvM2i9kUx61xDVA");
      const boundPoolInstance = await BoundPoolClient.fromBoundPoolId({ client, poolAccountAddressId });

      const inputAmount = "567.023231";
      await expect(
        boundPoolInstance.getOutputAmountForSellMeme({
          inputAmount: inputAmount,
          slippagePercentage: 100,
        }),
      ).rejects.toThrow("Slippage percentage must be between 0 (inclusive) and 100 (exclusive).");

      await expect(
        boundPoolInstance.sellMeme({
          inputAmount: inputAmount,
          minOutputAmount: "5",
          slippagePercentage: 100,
          user: payer.publicKey,
          signer: payer,
        }),
      ).rejects.toThrow("Slippage percentage must be between 0 (inclusive) and 100 (exclusive).");
    }, 150000);

    it("handles high slippage percentage for sellMeme", async () => {
      const poolAccountAddressId = new PublicKey("FrZBDKqxoNeyLYjLn2KM2nnVRWwpzZvM2i9kUx61xDVA");
      const boundPoolInstance = await BoundPoolClient.fromBoundPoolId({ client, poolAccountAddressId });

      const inputAmount = "567.023231";
      const minOutputAmount = await boundPoolInstance.getOutputAmountForSellMeme({
        inputAmount: inputAmount,
        slippagePercentage: 99,
      });

      const res = await boundPoolInstance.sellMeme({
        inputAmount: inputAmount,
        minOutputAmount: minOutputAmount,
        slippagePercentage: 99,
        user: payer.publicKey,
        signer: payer,
      });

      expect(res).toBeDefined();
    }, 150000);
  });
});
