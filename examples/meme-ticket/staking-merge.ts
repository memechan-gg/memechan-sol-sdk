import { PublicKey } from "@solana/web3.js";
import { MemeTicketClient } from "../../src/memeticket/MemeTicketClient";
import { client, payer } from "../common";

// yarn tsx examples/meme-ticket/staking-merge.ts > staking-merge.txt 2>&1
export const stakingMerge = async () => {
  const boundPoolAddress = new PublicKey("2paxDkj5zFR3DtMVZtmTSbkMYZwFtVZnq2Xv1WFHqgPo");
  const stakingPoolAddress = new PublicKey("sh5hozk6bENHvG4J5zrqW2S5eKjp68DRPZodCRLSkJU");
  const { tickets } = await MemeTicketClient.fetchAvailableTicketsByUser2(boundPoolAddress, client, payer.publicKey);

  if (tickets.length > 1) {
    const [destinationTicket, ...sourceTickets] = tickets;

    const destinationMemeTicket = new MemeTicketClient(destinationTicket.id, client);
    const sourceMemeTickets = sourceTickets.map((ticket) => new MemeTicketClient(ticket.id, client));

    await destinationMemeTicket.stakingMerge({
      staking: stakingPoolAddress,
      ticketsToMerge: sourceMemeTickets,
      user: payer.publicKey,
      signer: payer,
    });

    console.log("[stakingMerge] All the tickets are merged.");
  } else if (tickets.length === 1) {
    console.log("[stakingMerge] Nothing to merge, only one ticket available.");
  } else {
    console.log("[stakingMerge] Nothing to merge, no tickets available.");
  }
};

stakingMerge();
