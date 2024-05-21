import { PublicKey } from "@solana/web3.js";
import { MemeTicket } from "../../src/memeticket/MemeTicket";
import { client, payer } from "../common";

// yarn tsx examples/meme-ticket/get-available-staked-lp-by-owner.ts > available-staked-lp.txt 2>&1
export const getAvailableStakedLpByOwner = async () => {
  const poolAddress = new PublicKey("9Qy1JawWD9Ue7rWfCJUwcTDWqSSbS48e8MhqgGsprrcV");

  const tickets = await MemeTicket.fetchAvailableTicketsByUser(poolAddress, client, payer.publicKey);

  console.log("tickets:", tickets);
};

getAvailableStakedLpByOwner();
