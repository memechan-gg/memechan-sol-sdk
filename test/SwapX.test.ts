import { BoundPoolClient } from "../src/bound-pool/BoundPoolClient";
import { DUMMY_TOKEN_METADATA, admin, client, payer } from "./common/common";
import BN from "bn.js";
import { MEMECHAN_QUOTE_TOKEN } from "../src/config/config";
import { MintUtils } from "../src/token/mintUtils";
import { MemeTicketClient } from "../src";

export function test() {
  describe("swapX", () => {
    it("swaps user quote token->memecoin", async () => {
      const pool = await BoundPoolClient.new({
        admin,
        payer,
        client,
        quoteToken: MEMECHAN_QUOTE_TOKEN,
        tokenMetadata: DUMMY_TOKEN_METADATA,
      });

      const mintUtils = new MintUtils(client.connection, payer);
      const getAccount1 = await mintUtils.getOrCreateTokenAccount(MEMECHAN_QUOTE_TOKEN.mint, payer, payer.publicKey);

      const { tickets } = await MemeTicketClient.fetchTicketsByUser2(pool.id, client, payer.publicKey);
      const memeTicketNumber = tickets.length + MemeTicketClient.TICKET_NUMBER_START;

      const ticketId = await pool.swapY({
        payer: payer,
        user: payer,
        memeTokensOut: new BN(10 * 1e6),
        quoteAmountIn: new BN(1000 * 1e9),
        quoteMint: MEMECHAN_QUOTE_TOKEN.mint,
        pool: pool.id,
        memeTicketNumber,
      });

      console.log("swapx test - swapY ticketId: " + ticketId.id.toBase58());

      const txResult = await pool.swapX({
        user: payer,
        memeAmountIn: new BN(10 * 1e6),
        minQuoteAmountOut: new BN(1 * 1e6),
        quoteMint: MEMECHAN_QUOTE_TOKEN.mint,
        userMemeTicket: ticketId,
        userQuoteAcc: getAccount1.address,
      });

      console.log("swapX txResult: " + txResult);
    }, 420000);
  });
}
