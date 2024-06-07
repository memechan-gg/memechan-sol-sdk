import { PublicKey } from "@solana/web3.js";
import { MemeTicketClient } from "../../src/memeticket/MemeTicketClient";
import { client, payer } from "../common";

// yarn tsx examples/meme-ticket/get-user-tickets-2.ts > available-staked-lp.txt 2>&1
export const getAvailableStakedLpByOwner = async () => {
  const poolAddress = new PublicKey("2ST4K87fWWYdeJ5SWyrv7bdSZmd3cYoqsthDeQZZn2TY");

  const { availableAmount, availableAmountWithDecimals, tickets } = await MemeTicketClient.fetchAvailableTicketsByUser2(
    poolAddress,
    client,
    payer.publicKey,
  );

  console.log("\ntickets:", tickets);
  console.log("\navailableAmount:", availableAmount);
  console.log("\navailableAmountWithDecimals:", availableAmountWithDecimals);
};

getAvailableStakedLpByOwner();
