import { PublicKey } from "@solana/web3.js";
import { client, clientV2, payer } from "../../../common";
import { getBoundPoolClientFromId } from "../../../../src/util/poolHelpers/getBoundPoolClientFromId";
import { MemeTicketClientV2 } from "../../../../src/memeticket/MemeTicketClientV2";

// yarn tsx examples/v2/bonding-pool/trading/buy-meme.ts
(async () => {
  const poolAccountAddressId = new PublicKey("4iagw4iVieJ4jiiG5Mzvrosud87LU28vrAuVdg7tns6s");
  const { boundPoolInstance } = await getBoundPoolClientFromId(poolAccountAddressId, client, clientV2);

  const inputAmount = "0.0005";

  const minOutputAmount = await boundPoolInstance.getOutputAmountForBuyMeme({
    inputAmount: inputAmount,
    slippagePercentage: 0,
  });

  console.debug("minOutputAmount: ", minOutputAmount);

  return;
  const { tickets } = await MemeTicketClientV2.fetchTicketsByUser2(poolAccountAddressId, clientV2, payer.publicKey);
  const memeTicketNumber = tickets.length + MemeTicketClientV2.TICKET_NUMBER_START;

  console.debug("memeTicketNumber: ", memeTicketNumber);

  const res = await boundPoolInstance.buyMeme({
    inputAmount: inputAmount,
    minOutputAmount: minOutputAmount,
    slippagePercentage: 0,
    user: payer.publicKey,
    signer: payer,
    memeTicketNumber: memeTicketNumber,
  });

  console.debug("res: ");
  console.dir(res, { depth: null });
})();
