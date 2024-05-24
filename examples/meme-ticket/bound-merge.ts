import { PublicKey } from "@solana/web3.js";
import { MemeTicketClient } from "../../src/memeticket/MemeTicketClient";
import { client, payer } from "../common";

// yarn tsx examples/meme-ticket/bound-merge.ts > bound-merge.txt 2>&1
export const boundMerge = async () => {
  const poolAddress = new PublicKey("8ijpxuSMQH44dZ1xkUTv1Qw7Xa2dVJmG3pzLuj9VCG1x");
  const { tickets } = await MemeTicketClient.fetchAvailableTicketsByUser(poolAddress, client, payer.publicKey);

  if (tickets.length > 1) {
    const [destinationTicket, ...sourceTickets] = tickets;

    const destinationMemeTicket = new MemeTicketClient(destinationTicket.id, client);
    const sourceMemeTickets = sourceTickets.map((ticket) => new MemeTicketClient(ticket.id, client));

    await destinationMemeTicket.boundMerge({ pool: poolAddress, ticketsToMerge: sourceMemeTickets, user: payer });

    console.log("[boundMerge] All the tickets are merged.");
  } else if (tickets.length === 1) {
    console.log("[boundMerge] Nothing to merge, only one ticket available.");
  } else {
    console.log("[boundMerge] Nothing to merge, no tickets available.");
  }
};

boundMerge();
