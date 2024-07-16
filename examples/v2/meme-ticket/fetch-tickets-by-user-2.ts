import { PublicKey } from "@solana/web3.js";
import { MemeTicketClientV2 } from "../../../src";
import { createMemeChanClientV2 } from "../../common";

// yarn tsx examples/v2/meme-ticket/fetch-tickets-by-user-2.ts > fetch.txt 2>&1
export async function fetch() {
  const boundPoolAddress = new PublicKey("7EEuoUwjAHd39V9HizNEfVgweYuTrFqiZ4ZsTRWdtZTE");
  const userAddress = new PublicKey("HLaPceN1Hct4qvDC21PetsaVkyUrBC97n1FYeXAZ4mz5");
  const clientV2 = await createMemeChanClientV2();

  const tickets = await MemeTicketClientV2.fetchTicketsByUser2(boundPoolAddress, clientV2, userAddress);
  console.log("tickets:", tickets);
  console.log("tickets.length:", tickets.tickets.length);

  for (let i = 0; i < tickets.tickets.length; i++) {
    console.log("tickets[i].amountWithDecimals:", tickets.tickets[i].amountWithDecimals);
  }
}

fetch();
