import { BN } from "@coral-xyz/anchor";
import { BoundPoolClient } from "../src/bound-pool/BoundPoolClient";
import { DUMMY_TOKEN_METADATA, admin, client, payer } from "./common/common";
import { FEE_DESTINATION_ID, MEMECHAN_QUOTE_TOKEN } from "../src/config/config";
import { MemeTicketClient } from "../src/memeticket/MemeTicketClient";

describe("BoundPool", () => {
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

    const boundPool = await BoundPoolClient.newWithBuyTx(args);

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

  it("init staking pool then go live", async () => {
    console.log(" init staking pool then go live. " + new Date().toUTCString());
    console.log("payer: " + payer.publicKey.toString());
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

    const pool = await BoundPoolClient.newWithBuyTx(args);

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

  it("init staking pool, many swapy, then go live", async () => {
    console.log(" init staking pool, many swapy then go live. " + new Date().toUTCString());
    console.log("payer: " + payer.publicKey.toString());
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

    const pool = await BoundPoolClient.newWithBuyTx(args);

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
