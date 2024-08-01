import { PublicKey } from "@solana/web3.js";
import { MemeTicketClient } from "../../../src/memeticket/MemeTicketClient";
import { client, payer } from "../../common";

// yarn tsx examples/meme-ticket/bound-merge.ts > bound-merge.txt 2>&1
export const boundMerge = async () => {
  const poolAddress = new PublicKey("2ST4K87fWWYdeJ5SWyrv7bdSZmd3cYoqsthDeQZZn2TY");
  const { tickets } = await MemeTicketClient.fetchAvailableTicketsByUser2(poolAddress, client, payer.publicKey);

  if (tickets.length > 1) {
    const [destinationTicket, ...sourceTickets] = tickets;

    const destinationMemeTicket = new MemeTicketClient(destinationTicket.id, client);
    const sourceMemeTickets = sourceTickets.map((ticket) => new MemeTicketClient(ticket.id, client));

    await destinationMemeTicket.boundMerge({
      pool: poolAddress,
      ticketsToMerge: sourceMemeTickets,
      user: payer.publicKey,
      signer: payer,
    });

    console.log("[boundMerge] All the tickets are merged.");
  } else if (tickets.length === 1) {
    console.log("[boundMerge] Nothing to merge, only one ticket available.");
  } else {
    console.log("[boundMerge] Nothing to merge, no tickets available.");
  }
};

boundMerge();
