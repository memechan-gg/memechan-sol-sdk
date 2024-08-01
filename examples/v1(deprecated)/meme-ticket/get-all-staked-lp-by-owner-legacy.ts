import { PublicKey } from "@solana/web3.js";
import { MemeTicketClient } from "../../../src/memeticket/MemeTicketClient";
import { client, payer } from "../../common";

// yarn tsx examples/meme-ticket/get-all-staked-lp-by-owner-legacy.ts > all-staked-lp.txt 2>&1
export const getAllStakedLpByOwner = async () => {
  const poolAddress = new PublicKey("6uM2Yf9VbkNndDutv6gxmvs2MsUVvpzLenSKEn7s46No");

  const tickets = await MemeTicketClient.fetchTicketsByUser2(poolAddress, client, payer.publicKey);

  console.log("tickets:", tickets);
};

getAllStakedLpByOwner();
