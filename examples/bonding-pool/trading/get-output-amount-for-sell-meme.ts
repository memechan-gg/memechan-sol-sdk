import { PublicKey } from "@solana/web3.js";
import { BoundPoolClient } from "../../../src/bound-pool/BoundPoolClient";
import { client } from "../../common";

// yarn tsx examples/bonding-pool/trading/get-output-amount-for-sell-meme.ts
(async () => {
  const poolAccountAddressId = new PublicKey("2ST4K87fWWYdeJ5SWyrv7bdSZmd3cYoqsthDeQZZn2TY");
  const boundPoolInstance = await BoundPoolClient.fromBoundPoolId({ client, poolAccountAddressId });

  const res = await boundPoolInstance.getOutputAmountForSellMeme({
    inputAmount: "1000000",
    slippagePercentage: 0,
  });

  console.debug("res: ");
  console.dir(res, { depth: null });
})();
