import { BN } from "@project-serum/anchor";
import { BoundPoolClient } from "../src/bound-pool/BoundPool";
import { DUMMY_TOKEN_METADATA, admin, client, payer } from "./common/common";
import { MEMECHAN_QUOTE_TOKEN } from "../src/config/config";
import { sleep } from "../src/common/helpers";

describe("SwapY", () => {
  it.skip("swaps quote token->memecoin", async () => {
    const pool = await BoundPoolClient.slowNew({
      admin,
      payer,
      client,
      quoteToken: MEMECHAN_QUOTE_TOKEN,
      tokenMetadata: DUMMY_TOKEN_METADATA,
    });

    console.log("==== swapy pool id: " + pool.id.toString());

    await sleep(1000);

    // call to the swap endpoint
    const ticketId = await pool.swapY({
      payer: payer,
      user: payer,
      memeTokensOut: new BN(1),
      quoteAmountIn: new BN(1000),
      quoteMint: MEMECHAN_QUOTE_TOKEN.mint,
      pool: pool.id,
    });

    console.log("swapY ticketId: " + ticketId.id.toBase58());
  }, 220000);
});
