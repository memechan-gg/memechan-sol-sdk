import { PublicKey } from "@solana/web3.js";
import { MemeTicketClient } from "../../src/memeticket/MemeTicketClient";
import { client, payer } from "../common";

// yarn tsx examples/meme-ticket/get-all-staked-lp-by-owner.ts > all-staked-lp.txt 2>&1
export const getAllStakedLpByOwner = async () => {
  const poolAddress = new PublicKey("8T83gG397gcCaFh8hLiMECmhrmkLS7vtptMeLvCgwKde");

  const tickets = await MemeTicketClient.fetchTicketsByUser(poolAddress, client, payer.publicKey);

  console.log("tickets:", tickets);
};

getAllStakedLpByOwner();
