import { BoundPoolClient } from "../src/bound-pool/BoundPool";
import { DUMMY_TOKEN_METADATA, admin, client, payer } from "./common/common";
import BN from "bn.js";
import { sleep } from "../src/common/helpers";
import { MEMECHAN_QUOTE_TOKEN } from "../src/config/config";
import { MintUtils } from "../src/token/mintUtils";

describe("swapX", () => {
  it.skip("swaps user quote token->memecoin", async () => {
    const pool = await BoundPoolClient.slowNew({
      admin,
      payer,
      client,
      quoteToken: MEMECHAN_QUOTE_TOKEN,
      tokenMetadata: DUMMY_TOKEN_METADATA,
    });

    const mintUtils = new MintUtils(client.connection, payer);

    const getAccount1 = await mintUtils.getOrCreateTokenAccount(MEMECHAN_QUOTE_TOKEN.mint, payer, payer.publicKey);
    await mintUtils.mintTo(MEMECHAN_QUOTE_TOKEN.mint, getAccount1.address);

    await sleep(1000);

    const ticketId = await pool.swapY({
      payer: payer,
      user: payer,
      memeTokensOut: new BN(10),
      quoteAmountIn: new BN(1000),
      quoteMint: MEMECHAN_QUOTE_TOKEN.mint,
      pool: pool.id,
    });

    console.log("swapx test - swapY ticketId: " + ticketId.id.toBase58());

    await sleep(1000);

    const txResult = await pool.swapX({
      user: payer,
      memeAmountIn: new BN(10000),
      minQuoteAmountOut: new BN(1),
      quoteMint: MEMECHAN_QUOTE_TOKEN.mint,
      userMemeTicket: ticketId,
      userQuoteAcc: getAccount1.address,
    });

    console.log("swapX txResult: " + txResult);
  }, 420000);
});
