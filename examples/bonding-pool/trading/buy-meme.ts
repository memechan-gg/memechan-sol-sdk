import { PublicKey } from "@solana/web3.js";
import { BoundPoolClient } from "../../../src/bound-pool/BoundPoolClient";
import { client, payer } from "../../common";
import { MemeTicketClient } from "../../../src";

// yarn tsx examples/bonding-pool/trading/buy-meme.ts
(async () => {
  const poolAccountAddressId = new PublicKey("7y7g19JdRaTNhSChuiXBoujAzkCCPDZeFFa4XWLU1oE1");
  const boundPoolInstance = await BoundPoolClient.fromBoundPoolId({ client, poolAccountAddressId });

  const inputAmount = "0.001";

  const minOutputAmount = await boundPoolInstance.getOutputAmountForBuyMeme({
    inputAmount: inputAmount,
    slippagePercentage: 0,
  });

  console.debug("minOutputAmount: ", minOutputAmount);

  const { tickets } = await MemeTicketClient.fetchTicketsByUser2(poolAccountAddressId, client, payer.publicKey);
  const memeTicketNumber = tickets.length + MemeTicketClient.TICKET_NUMBER_START;

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
