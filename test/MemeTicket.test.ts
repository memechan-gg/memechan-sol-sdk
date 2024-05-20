import BN from "bn.js";
import { BoundPoolClient } from "../src/bound-pool/BoundPool";
import { sleep } from "../src/common/helpers";
import { MemeTicket } from "../src/memeticket/MemeTicket";
import { DUMMY_TOKEN_METADATA, LIVE_BOUND_POOL_ID, admin, client, payer } from "./common/common";
import { MEMECHAN_QUOTE_TOKEN } from "../src/config/config";
import { FEE_DESTINATION_ID } from "./common/env";
import { MintUtils } from "../src/token/mintUtils";

describe("MemeTicket", () => {
  it.skip("all", async () => {
    const all = await MemeTicket.all(client.memechanProgram);

    for (const pool of all) {
      //console.log(JSON.stringify(pool.account));
      //console.log("==================================================");
    }
  }, 30000);

  it.skip("merge tickets presale", async () => {
      const pool = await BoundPoolClient.fromBoundPoolId({client, poolAccountAddressId: LIVE_BOUND_POOL_ID});

      const tickets: MemeTicket[] = [];

      tickets.push(await pool.swapY({
        payer: payer,
        user: payer,
        memeTokensOut: new BN(1),
        quoteAmountIn: new BN(1000),
        quoteMint: MEMECHAN_QUOTE_TOKEN.mint,
        pool: pool.id,
      }));

      console.log("ticket1: " + tickets[0].id.toBase58());

      tickets.push(await pool.swapY({
        payer: payer,
        user: payer,
        memeTokensOut: new BN(2),
        quoteAmountIn: new BN(2000),
        quoteMint: MEMECHAN_QUOTE_TOKEN.mint,
        pool: pool.id,
      }));

      console.log("ticket2: " + tickets[1].id.toBase58());

      tickets.push(await pool.swapY({
        payer: payer,
        user: payer,
        memeTokensOut: new BN(3),
        quoteAmountIn: new BN(3000),
        quoteMint: MEMECHAN_QUOTE_TOKEN.mint,
        pool: pool.id,
      }));

      console.log("ticket3: " + tickets[2].id.toBase58());

      const mergedTicket1 = await tickets[0].boundMerge({
        pool: pool.id,
        ticketToMerge: tickets[1],
        user: payer
      });
      sleep(1000);

      console.log("mergedTicket1: " + mergedTicket1.id.toBase58());

      const mergedTicket2 = await tickets[0].boundMerge({
        pool: pool.id,
        ticketToMerge: tickets[2],
        user: payer
      })
      sleep(1000);

      console.log("mergedTicket2: " + mergedTicket2.id.toBase58());
    }, 220000);

    it.skip("merge tickets live", async () => {
      const pool = await BoundPoolClient.slowNew({
        admin,
        payer,
        signer: payer,
        client,
        quoteToken: MEMECHAN_QUOTE_TOKEN,
        tokenMetadata: DUMMY_TOKEN_METADATA,
      });

      const tickets: MemeTicket[] = [];

      tickets.push(await pool.swapY({
        payer: payer,
        user: payer,
        memeTokensOut: new BN(1),
        quoteAmountIn: new BN(1000),
        quoteMint: MEMECHAN_QUOTE_TOKEN.mint,
        pool: pool.id,
      }));

      console.log("ticket1: " + tickets[0].id.toBase58());

      tickets.push(await pool.swapY({
        payer: payer,
        user: payer,
        memeTokensOut: new BN(2),
        quoteAmountIn: new BN(2000),
        quoteMint: MEMECHAN_QUOTE_TOKEN.mint,
        pool: pool.id,
      }));

      console.log("ticket2: " + tickets[1].id.toBase58());

      tickets.push(await pool.swapY({
        payer: payer,
        user: payer,
        memeTokensOut: new BN(3),
        quoteAmountIn: new BN(3000),
        quoteMint: MEMECHAN_QUOTE_TOKEN.mint,
        pool: pool.id,
      }));

      console.log("ticket3: " + tickets[2].id.toBase58());


      const boundPoolInfo = await BoundPoolClient.fetch2(client.connection, pool.id);

      console.log("boundPoolInfo:", boundPoolInfo);

      const { stakingMemeVault, stakingQuoteVault } = await pool.slowInitStakingPool({
        payer: payer,
        user: payer,
        boundPoolInfo,
      });

      console.log("stakingMemeVault: " + stakingMemeVault.toString());
      console.log("stakingQuoteVault: " + stakingQuoteVault.toString());

      await sleep(2000);

      const [stakingPool ] = await pool.goLive({
        payer: payer,
        user: payer,
        boundPoolInfo,
        feeDestinationWalletAddress: FEE_DESTINATION_ID,
        memeVault: stakingMemeVault,
        quoteVault: stakingQuoteVault,
      });

      const mergedTicket1 = await tickets[0].stakingMerge({
        staking: stakingPool.id,
        ticketToMerge: tickets[1],
        user: payer
      });
      sleep(1000);

      console.log("mergedTicket1: " + mergedTicket1.id.toBase58());

      const mergedTicket2 = await tickets[0].stakingMerge({
        staking: stakingPool.id,
        ticketToMerge: tickets[2],
        user: payer
      })
      sleep(1000);

      console.log("mergedTicket2: " + mergedTicket2.id.toBase58());
    }, 520000);

    it("close ticket", async () => {
      const pool = await BoundPoolClient.fromBoundPoolId({client, poolAccountAddressId: LIVE_BOUND_POOL_ID});

      const ticket = await pool.swapY({
        payer: payer,
        user: payer,
        memeTokensOut: new BN(1),
        quoteAmountIn: new BN(1000),
        quoteMint: MEMECHAN_QUOTE_TOKEN.mint,
        pool: pool.id,
      });

      console.log("ticket: " + ticket.id.toBase58());

      const ticketInfo = await ticket.fetch();

      console.log("ticketInfo: ", ticketInfo);

      const mintUtils = new MintUtils(client.connection, payer);
      const quoteAccount = await mintUtils.getOrCreateTokenAccount(MEMECHAN_QUOTE_TOKEN.mint, payer, payer.publicKey );

      await sleep(5000);

      const swapXTxResult = await pool.swapX({
        user: payer,
        memeAmountIn: ticketInfo.amount,
        minQuoteAmountOut: new BN(1),
        quoteMint: MEMECHAN_QUOTE_TOKEN.mint,
        userMemeTicket: ticket,
        userQuoteAcc: quoteAccount.address,
      })

      console.log("swapXTxResult: " + swapXTxResult);
        
      const closedTicket = await ticket.close({
        user: payer
      });

      console.log("closedTicket: " + closedTicket.id.toBase58());
    }, 220000);
});
