import { PublicKey } from "@solana/web3.js";
import { MemeTicket } from "../../src/memeticket/MemeTicket";
import { client, payer } from "../common";

// yarn tsx examples/bonding-pool/get-available-staked-lp-by-owner.ts > available-staked-lp.txt 2>&1
export const getAvailableStakedLpByOwner = async () => {
  const poolAddress = new PublicKey("9Qy1JawWD9Ue7rWfCJUwcTDWqSSbS48e8MhqgGsprrcV");

  const tickets = await MemeTicket.fetchAvailableTicketsByUser(poolAddress, client, payer.publicKey);
  const stringifiedTickets = tickets.map((ticket) => {
    return {
      ...ticket,
      amount: ticket.amount.toString(),
      untilTimestamp: ticket.untilTimestamp.toString(),
    };
  });

  console.log("tickets:", stringifiedTickets);
};

getAvailableStakedLpByOwner();
