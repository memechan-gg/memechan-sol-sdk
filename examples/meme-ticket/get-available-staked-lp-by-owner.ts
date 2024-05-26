import { PublicKey } from "@solana/web3.js";
import { MemeTicketClient } from "../../src/memeticket/MemeTicketClient";
import { client, payer } from "../common";

// yarn tsx examples/meme-ticket/get-available-staked-lp-by-owner.ts > available-staked-lp.txt 2>&1
export const getAvailableStakedLpByOwner = async () => {
  const poolAddress = new PublicKey("9Qy1JawWD9Ue7rWfCJUwcTDWqSSbS48e8MhqgGsprrcV");

  const { availableAmount, availableAmountWithDecimals, tickets } = await MemeTicketClient.fetchAvailableTicketsByUser(
    poolAddress,
    client,
    payer.publicKey,
  );

  console.log("\ntickets:", tickets);
  console.log("\navailableAmount:", availableAmount);
  console.log("\navailableAmountWithDecimals:", availableAmountWithDecimals);
};

getAvailableStakedLpByOwner();
