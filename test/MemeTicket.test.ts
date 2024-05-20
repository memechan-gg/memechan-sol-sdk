import BN from "bn.js";
import { BoundPoolClient } from "../src/bound-pool/BoundPool";
import { sleep } from "../src/common/helpers";
import { MemeTicket } from "../src/memeticket/MemeTicket";
import { LIVE_BOUND_POOL_ID, client, payer } from "./common/common";
import { MEMECHAN_QUOTE_TOKEN } from "../src/config/config";

describe("MemeTicket", () => {
  it.skip("all", async () => {
    const all = await MemeTicket.all(client.memechanProgram);

    for (const pool of all) {
      //console.log(JSON.stringify(pool.account));
      //console.log("==================================================");
    }
  }, 30000);

  it("merge tickets presale", async () => {
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
});
