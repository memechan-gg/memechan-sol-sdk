import { PublicKey } from "@solana/web3.js";
import { MemeTicket } from "../../src/memeticket/MemeTicket";
import { client, payer } from "../common";

// yarn tsx examples/meme-ticket/staking-merge.ts > staking-merge.txt 2>&1
export const stakingMerge = async () => {
  const boundPoolAddress = new PublicKey("6X15H5NFQbbLoZ2pfwBaQKd1vnjfhUGUcnQkRs9Jdoqo");
  const stakingPoolAddress = new PublicKey("HvMGGbeGnnzBMpdFJyr3RudHSqHPEvERF93EmkHPfaxn");
  const { tickets } = await MemeTicket.fetchAvailableTicketsByUser(boundPoolAddress, client, payer.publicKey);

  if (tickets.length > 1) {
    const [destinationTicket, ...sourceTickets] = tickets;

    const destinationMemeTicket = new MemeTicket(destinationTicket.id, client);
    const sourceMemeTickets = sourceTickets.map((ticket) => new MemeTicket(ticket.id, client));

    await destinationMemeTicket.stakingMerge({
      staking: stakingPoolAddress,
      ticketsToMerge: sourceMemeTickets,
      user: payer,
    });

    console.log("[stakingMerge] All the tickets are merged.");
  } else if (tickets.length === 1) {
    console.log("[stakingMerge] Nothing to merge, only one ticket available.");
  } else {
    console.log("[stakingMerge] Nothing to merge, no tickets available.");
  }
};

stakingMerge();
