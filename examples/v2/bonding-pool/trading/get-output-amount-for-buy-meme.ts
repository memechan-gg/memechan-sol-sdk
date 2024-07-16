import { PublicKey } from "@solana/web3.js";
import { getBoundPoolClientFromId } from "../../../../src/util/poolHelpers/getBoundPoolClientFromId";
import { createMemeChanClient, createMemeChanClientV2 } from "../../../common";

// yarn tsx examples/v2/bonding-pool/trading/get-output-amount-for-buy-meme.ts
(async () => {
  const poolAccountAddressId = new PublicKey("3t4JciTpGQbUWSGjx3rJnt9q2xJZHvFQFDiH6oRF3Zid");

  const client = await createMemeChanClient();
  const clientV2 = await createMemeChanClientV2();
  const { boundPoolInstance } = await getBoundPoolClientFromId(poolAccountAddressId, client, clientV2);

  const res = await boundPoolInstance.getOutputAmountForBuyMeme({
    inputAmount: "0.001",
    slippagePercentage: 0,
  });

  console.debug("getOutputAmountForBuyMeme: ");
  console.dir(res, { depth: null });
})();
