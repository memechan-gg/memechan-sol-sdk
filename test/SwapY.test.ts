import { BN } from "@project-serum/anchor";
import { BoundPoolClient } from "../src/bound-pool/BoundPoolClient";
import { DUMMY_TOKEN_METADATA, admin, client, payer } from "./common/common";
import { connection } from "../examples/common";
import { MemeTicketClient, TOKEN_INFOS } from "../src";

export function test() {
  describe("SwapY", () => {
    it("swaps quote token->memecoin", async () => {
      const pool = await BoundPoolClient.new({
        admin,
        payer,
        client,
        quoteToken: TOKEN_INFOS.WSOL,
        tokenMetadata: DUMMY_TOKEN_METADATA,
      });

      console.log("==== swapy pool id: " + pool.id.toString());
      const { tickets } = await MemeTicketClient.fetchTicketsByUser2(pool.id, client, payer.publicKey);
      const memeTicketNumber = tickets.length + MemeTicketClient.TICKET_NUMBER_START;

      // call to the swap endpoint
      const ticketId = await pool.swapY({
        payer: payer,
        user: payer,
        memeTokensOut: new BN(10 * 1e6),
        quoteAmountIn: new BN(1000 * 1e9),
        quoteMint: TOKEN_INFOS.WSOL.mint,
        pool: pool.id,
        memeTicketNumber,
      });

      console.log("swapY ticketId: " + ticketId.id.toBase58());
    }, 220000);

    it("swaps 1 quote token->memecoin should fail", async () => {
      const pool = await BoundPoolClient.new({
        admin,
        payer,
        client,
        quoteToken: TOKEN_INFOS.WSOL,
        tokenMetadata: DUMMY_TOKEN_METADATA,
      });

      console.log("==== swapy pool id: " + pool.id.toString());

      const { tickets } = await MemeTicketClient.fetchTicketsByUser2(pool.id, client, payer.publicKey);
      const memeTicketNumber = tickets.length + MemeTicketClient.TICKET_NUMBER_START;

      // call to the swap endpoint
      const ticketId = await pool.swapY({
        payer: payer,
        user: payer,
        memeTokensOut: new BN(1),
        quoteAmountIn: new BN(1),
        quoteMint: TOKEN_INFOS.WSOL.mint,
        pool: pool.id,
        memeTicketNumber,
      });

      console.log("swapY ticketId: " + ticketId.id.toBase58());
      const ticket = await connection.getAccountInfo(ticketId.id, { commitment: "confirmed" });
      console.log("fetched ticket", ticket);
      expect(ticket).toBeNull();
    }, 220000);

    it("swaps minimum quote token->memecoin", async () => {
      const pool = await BoundPoolClient.new({
        admin,
        payer,
        client,
        quoteToken: TOKEN_INFOS.WSOL,
        tokenMetadata: DUMMY_TOKEN_METADATA,
      });

      console.log("==== swapy pool id: " + pool.id.toString());

      const { tickets } = await MemeTicketClient.fetchTicketsByUser2(pool.id, client, payer.publicKey);
      const memeTicketNumber = tickets.length + MemeTicketClient.TICKET_NUMBER_START;

      // call to the swap endpoint
      const ticketId = await pool.swapY({
        payer: payer,
        user: payer,
        memeTokensOut: new BN(1),
        quoteAmountIn: new BN(2),
        quoteMint: TOKEN_INFOS.WSOL.mint,
        pool: pool.id,
        memeTicketNumber,
      });

      console.log("swapY ticketId: " + ticketId.id.toBase58());
      const ticket = await connection.getAccountInfo(ticketId.id, { commitment: "confirmed" });
      console.log("fetched ticket", ticket);
    }, 220000);

    it("swaps maximum quote token->memecoin", async () => {
      const pool = await BoundPoolClient.new({
        admin,
        payer,
        client,
        quoteToken: TOKEN_INFOS.WSOL,
        tokenMetadata: DUMMY_TOKEN_METADATA,
      });

      console.log("==== swapy pool id: " + pool.id.toString());
      const { tickets } = await MemeTicketClient.fetchTicketsByUser2(pool.id, client, payer.publicKey);
      const memeTicketNumber = tickets.length + MemeTicketClient.TICKET_NUMBER_START;

      // call to the swap endpoint
      const ticketId = await pool.swapY({
        payer: payer,
        user: payer,
        memeTokensOut: new BN(1),
        quoteAmountIn: new BN("999999999999999999"),
        quoteMint: TOKEN_INFOS.WSOL.mint,
        pool: pool.id,
        memeTicketNumber: memeTicketNumber,
      });

      console.log("swapY ticketId: " + ticketId.id.toBase58());
      const ticket = await connection.getAccountInfo(ticketId.id, { commitment: "confirmed" });
      console.log("fetched ticket", ticket);
    }, 220000);

    it("swaps exact threshold + fee token->memecoin", async () => {
      const pool = await BoundPoolClient.new({
        admin,
        payer,
        client,
        quoteToken: TOKEN_INFOS.WSOL,
        tokenMetadata: DUMMY_TOKEN_METADATA,
      });

      console.log("==== swapy pool id: " + pool.id.toString());

      const { tickets } = await MemeTicketClient.fetchTicketsByUser2(pool.id, client, payer.publicKey);
      const memeTicketNumber = tickets.length + MemeTicketClient.TICKET_NUMBER_START;

      // call to the swap endpoint
      const ticketId = await pool.swapY({
        payer: payer,
        user: payer,
        memeTokensOut: new BN(1),
        quoteAmountIn: new BN(40_201_005_025_126), // exact value 40201.005025126
        quoteMint: TOKEN_INFOS.WSOL.mint,
        pool: pool.id,
        memeTicketNumber,
      });

      console.log("swapY ticketId: " + ticketId.id.toBase58());
      const pool2 = await BoundPoolClient.fetch2(client.connection, pool.id);
      console.log("boundPoolInfo:", pool2);

      expect(pool2.locked).toBeTruthy();
    }, 220000);

    it.skip("swaps below exact threshold + fee quote token->memecoin", async () => {
      const pool = await BoundPoolClient.new({
        admin,
        payer,
        client,
        quoteToken: TOKEN_INFOS.WSOL,
        tokenMetadata: DUMMY_TOKEN_METADATA,
      });

      console.log("==== swapy pool id: " + pool.id.toString());

      // call to the swap endpoint
      const ticketId = await pool.swapY({
        payer: payer,
        user: payer,
        memeTokensOut: new BN(1),
        quoteAmountIn: new BN(40_201_005_000_000), // below exact value 40201.005
        quoteMint: TOKEN_INFOS.WSOL.mint,
        pool: pool.id,
        memeTicketNumber: 1,
      });

      console.log("swapY ticketId: " + ticketId.id.toBase58());
      const pool2 = await BoundPoolClient.fetch2(client.connection, pool.id);
      console.log("boundPoolInfo:", pool2);

      expect(pool2.locked).toBeFalsy();
    }, 220000);

    it("swaps 0", async () => {
      const pool = await BoundPoolClient.new({
        admin,
        payer,
        client,
        quoteToken: TOKEN_INFOS.WSOL,
        tokenMetadata: DUMMY_TOKEN_METADATA,
      });

      console.log("==== swapy pool id: " + pool.id.toString());

      // call to the swap endpoint
      await expect(
        pool.swapY({
          payer: payer,
          user: payer,
          memeTokensOut: new BN(1),
          quoteAmountIn: new BN(0),
          quoteMint: TOKEN_INFOS.WSOL.mint,
          pool: pool.id,
          memeTicketNumber: 1,
        }),
      ).rejects.toThrow();
      await expect(
        pool.swapY({
          payer: payer,
          user: payer,
          memeTokensOut: new BN(1),
          quoteAmountIn: new BN(0),
          quoteMint: TOKEN_INFOS.WSOL.mint,
          pool: pool.id,
          memeTicketNumber: 1,
        }),
      ).rejects.toThrow();
    }, 220000);

    // strange behavour, it should fail, but it converts negative amount to positive
    it("swaps negative", async () => {
      const pool = await BoundPoolClient.new({
        admin,
        payer,
        client,
        quoteToken: TOKEN_INFOS.WSOL,
        tokenMetadata: DUMMY_TOKEN_METADATA,
      });

      console.log("==== swapy pool id: " + pool.id.toString());

      // call to the swap endpoint
      const ticketId = await pool.swapY({
        payer: payer,
        user: payer,
        memeTokensOut: new BN(1),
        quoteAmountIn: new BN(-1000 * 1e9),
        quoteMint: TOKEN_INFOS.WSOL.mint,
        pool: pool.id,
        memeTicketNumber: 1,
      });

      console.log("swaps negative swapY ticketId: " + ticketId.id.toBase58());
      const pool2 = await BoundPoolClient.fetch2(client.connection, pool.id);
      console.log("swaps negative boundPoolInfo:", pool2);
      expect(pool2.locked).toBeFalsy();
    }, 220000);
  });
}
