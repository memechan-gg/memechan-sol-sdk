import { PublicKey } from "@solana/web3.js";
import { MemeTicket } from "../../src/memeticket/MemeTicket";
import { client, payer } from "../common";

// yarn tsx examples/meme-ticket/get-all-staked-lp-by-owner.ts > all-staked-lp.txt 2>&1
export const getAllStakedLpByOwner = async () => {
  const poolAddress = new PublicKey("9Qy1JawWD9Ue7rWfCJUwcTDWqSSbS48e8MhqgGsprrcV");

  const tickets = await MemeTicket.fetchTicketsByUser(poolAddress, client, payer.publicKey);

  console.log("tickets:", tickets);
};

getAllStakedLpByOwner();
