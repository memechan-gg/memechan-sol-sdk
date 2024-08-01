import { PublicKey } from "@solana/web3.js";
import { MemeTicketClient } from "../../../src/memeticket/MemeTicketClient";
import { client, payer } from "../../common";

// yarn tsx examples/meme-ticket/get-all-staked-lp-by-owner.ts > all-staked-lp.txt 2>&1
export const getAllStakedLpByOwner = async () => {
  const poolAddress = new PublicKey("2ST4K87fWWYdeJ5SWyrv7bdSZmd3cYoqsthDeQZZn2TY");

  const tickets = await MemeTicketClient.fetchAvailableTicketsByUser2(poolAddress, client, payer.publicKey);

  console.log("tickets:", tickets);
};

getAllStakedLpByOwner();
