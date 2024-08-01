import { PublicKey } from "@solana/web3.js";
import { MemeTicketClient } from "../../../src/memeticket/MemeTicketClient";
import { client, payer } from "../../common";

// yarn tsx examples/meme-ticket/get-user-tickets-2.ts > available-staked-lp.txt 2>&1
export const getAvailableStakedLpByOwner = async () => {
  const poolAddress = new PublicKey("6uM2Yf9VbkNndDutv6gxmvs2MsUVvpzLenSKEn7s46No");

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
