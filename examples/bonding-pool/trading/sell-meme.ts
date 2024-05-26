import { PublicKey } from "@solana/web3.js";
import { BoundPoolClient } from "../../../src/bound-pool/BoundPoolClient";
import { client, payer } from "../../common";

// yarn tsx examples/bonding-pool/trading/sell-meme.ts
(async () => {
  const poolAccountAddressId = new PublicKey("8T83gG397gcCaFh8hLiMECmhrmkLS7vtptMeLvCgwKde");
  const boundPoolInstance = await BoundPoolClient.fromBoundPoolId({ client, poolAccountAddressId });

  const inputAmount = "567.023231";

  const minOutputAmount = await boundPoolInstance.getOutputAmountForSellMeme({
    inputAmount: inputAmount,
    slippagePercentage: 0,
  });

  console.debug("minOutputAmount: ", minOutputAmount);
  const res = await boundPoolInstance.sellMeme({
    inputAmount: inputAmount,
    minOutputAmount: minOutputAmount,
    slippagePercentage: 0,
    user: payer.publicKey,
    signer: payer,
  });

  console.debug("res: ");
  console.dir(res, { depth: null });
})();
