import { BN } from "@project-serum/anchor";
import { BoundPoolClient } from "../src/bound-pool/BoundPoolClient";
import { DUMMY_TOKEN_METADATA, admin, client, payer } from "./common/common";
import { MEMECHAN_QUOTE_TOKEN } from "../src/config/config";
import { sleep } from "../src/common/helpers";
import { connection } from "../examples/common";

describe("SwapY", () => {
  it.skip("swaps quote token->memecoin", async () => {
    const pool = await BoundPoolClient.new({
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
      memeTokensOut: new BN(10 * 1e6),
      quoteAmountIn: new BN(1000 * 1e9),
      quoteMint: MEMECHAN_QUOTE_TOKEN.mint,
      pool: pool.id,
    });

    console.log("swapY ticketId: " + ticketId.id.toBase58());
  }, 220000);

  it.skip("swaps 1 quote token->memecoin should fail", async () => {
    const pool = await BoundPoolClient.new({
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
      quoteAmountIn: new BN(1),
      quoteMint: MEMECHAN_QUOTE_TOKEN.mint,
      pool: pool.id,
    });

    console.log("swapY ticketId: " + ticketId.id.toBase58());
    const ticket = await connection.getAccountInfo(ticketId.id);
    console.log("fetched ticket", ticket);
    expect(ticket).toBeNull();
  }, 220000);

  it.skip("swaps minimum quote token->memecoin", async () => {
    const pool = await BoundPoolClient.new({
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
      quoteAmountIn: new BN(2),
      quoteMint: MEMECHAN_QUOTE_TOKEN.mint,
      pool: pool.id,
    });

    console.log("swapY ticketId: " + ticketId.id.toBase58());
    const ticket = await connection.getAccountInfo(ticketId.id);
    console.log("fetched ticket", ticket);
  }, 220000);

  it.skip("swaps maximum quote token->memecoin", async () => {
    const pool = await BoundPoolClient.new({
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
      quoteAmountIn: new BN("999999999999999999"),
      quoteMint: MEMECHAN_QUOTE_TOKEN.mint,
      pool: pool.id,
    });

    console.log("swapY ticketId: " + ticketId.id.toBase58());
    const ticket = await connection.getAccountInfo(ticketId.id);
    console.log("fetched ticket", ticket);
  }, 220000);

  it.skip("swaps exact threshold + fee token->memecoin", async () => {
    const pool = await BoundPoolClient.new({
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
      quoteAmountIn: new BN(40_201_005_025_126), // exact value 40201.005025126
      quoteMint: MEMECHAN_QUOTE_TOKEN.mint,
      pool: pool.id,
    });

    console.log("swapY ticketId: " + ticketId.id.toBase58());
    const pool2 = await BoundPoolClient.fetch2(client.connection, pool.id);
    console.log("boundPoolInfo:", pool2);

    expect(pool2.locked).toBeTruthy();
  }, 220000);

  it("swaps below exact threshold + fee quote token->memecoin", async () => {
    const pool = await BoundPoolClient.new({
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
      quoteAmountIn: new BN(40_201_005_000_000), // below exact value 40201.005
      quoteMint: MEMECHAN_QUOTE_TOKEN.mint,
      pool: pool.id,
    });

    console.log("swapY ticketId: " + ticketId.id.toBase58());
    const pool2 = await BoundPoolClient.fetch2(client.connection, pool.id);
    console.log("boundPoolInfo:", pool2);

    expect(pool2.locked).toBeFalsy();
  }, 220000);
});
