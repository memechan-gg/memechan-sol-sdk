import { BN } from "@coral-xyz/anchor";
import { BoundPoolClient } from "../src/bound-pool/BoundPoolClient";
import { DEFAULT_BOUND_POOL_WITH_BUY_MEME_ARGS, client, payer } from "./common/common";
import { FEE_DESTINATION_ID, MEMECHAN_QUOTE_TOKEN } from "../src/config/config";
import { MemeTicketClient } from "../src/memeticket/MemeTicketClient";

export function test() {
  describe("BoundPool", () => {
    it.skip("all", async () => {
      const all = await BoundPoolClient.all(client.memechanProgram);
      console.log("all BoundPool length: " + all.length);
    }, 30000);

    it.skip("swapy, golive, should fail below tresholds", async () => {
      const boundPool = await BoundPoolClient.newWithBuyTx(DEFAULT_BOUND_POOL_WITH_BUY_MEME_ARGS);
      console.log("==== pool id: " + boundPool.id.toString() + ", " + new Date().toUTCString());

      const tickets = await MemeTicketClient.fetchTicketsByUser2(boundPool.id, client, payer.publicKey);
      let memeTicketNumber = tickets.length + MemeTicketClient.TICKET_NUMBER_START;
      const ticketClients: MemeTicketClient[] = [];

      const ticketId = await boundPool.swapY({
        payer: payer,
        user: payer,
        memeTokensOut: new BN(100 * 1e6),
        quoteAmountIn: new BN(500 * 1e9),
        quoteMint: MEMECHAN_QUOTE_TOKEN.mint,
        pool: boundPool.id,
        memeTicketNumber: memeTicketNumber++, // +1
      });

      ticketClients.push(new MemeTicketClient(ticketId.id, client));
      console.log("swapY ticketId: " + ticketId.id.toBase58() + ", " + new Date().toUTCString());

      const ticketId2 = await boundPool.swapY({
        payer: payer,
        user: payer,
        memeTokensOut: new BN(100 * 1e6),
        quoteAmountIn: new BN(499 * 1e9),
        quoteMint: MEMECHAN_QUOTE_TOKEN.mint,
        pool: boundPool.id,
        memeTicketNumber: memeTicketNumber++, // +1
      });

      ticketClients.push(new MemeTicketClient(ticketId2.id, client));
      console.log("swapY ticketId2: " + ticketId2.id.toBase58() + ", " + new Date().toUTCString());

      const boundPoolInfo = await BoundPoolClient.fetch2(client.connection, boundPool.id);

      console.log("boundPoolInfo:", boundPoolInfo);

      await expect(
        boundPool.initStakingPool({
          payer: payer,
          user: payer,
          boundPoolInfo,
        }),
      ).rejects.toThrow();
    }, 550000);

    it("init staking pool then go live", async () => {
      console.log(" init staking pool then go live. " + new Date().toUTCString());

      const pool = await BoundPoolClient.newWithBuyTx(DEFAULT_BOUND_POOL_WITH_BUY_MEME_ARGS);

      console.log("==== pool id: " + pool.id.toString());

      // const ticketId = await pool.swapY({
      //   payer: payer,
      //   user: payer,
      //   memeTokensOut: new BN(1000 * 1e6),
      //   quoteAmountIn: new BN(100000 * 1e9),
      //   quoteMint: MEMECHAN_QUOTE_TOKEN.mint,
      //   pool: pool.id,
      // });

      const inputAmount = "41000";
      const minOutputAmount = await pool.getOutputAmountForBuyMeme({
        inputAmount: inputAmount,
        slippagePercentage: 0,
      });

      console.log("minOutputAmount: " + minOutputAmount);

      const tickets = await MemeTicketClient.fetchTicketsByUser2(pool.id, client, payer.publicKey);
      const memeTicketNumber = tickets.length + MemeTicketClient.TICKET_NUMBER_START;

      const res = await pool.buyMeme({
        inputAmount: inputAmount,
        minOutputAmount: minOutputAmount,
        slippagePercentage: 0,
        user: payer.publicKey,
        signer: payer,
        memeTicketNumber,
      });

      console.log("buymeme result: " + res);

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

      const pool = await BoundPoolClient.newWithBuyTx(DEFAULT_BOUND_POOL_WITH_BUY_MEME_ARGS);

      console.log("==== pool id: " + pool.id.toString());

      const tickets = await MemeTicketClient.fetchTicketsByUser2(pool.id, client, payer.publicKey);
      let memeTicketNumber = tickets.length + MemeTicketClient.TICKET_NUMBER_START;

      for (let i = 0; i < 11; i++) {
        const ticketId = await pool.swapY({
          payer: payer,
          user: payer,
          memeTokensOut: new BN(100 * 1e6),
          quoteAmountIn: new BN(4000 * 1e9),
          quoteMint: MEMECHAN_QUOTE_TOKEN.mint,
          pool: pool.id,
          memeTicketNumber: memeTicketNumber++, // +1
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
}
