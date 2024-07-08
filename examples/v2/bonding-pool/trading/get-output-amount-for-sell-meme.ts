import { PublicKey } from "@solana/web3.js";
import { client, clientV2 } from "../../../common";
import { getBoundPoolClientFromId } from "../../../../src/util/poolHelpers/getBoundPoolClientFromId";

// yarn tsx examples/v2/bonding-pool/trading/get-output-amount-for-sell-meme.ts
(async () => {
  const poolAccountAddressId = new PublicKey("3t4JciTpGQbUWSGjx3rJnt9q2xJZHvFQFDiH6oRF3Zid");
  const { boundPoolInstance } = await getBoundPoolClientFromId(poolAccountAddressId, client, clientV2);

  const res = await boundPoolInstance.getOutputAmountForSellMeme({
    inputAmount: "59401500",
    slippagePercentage: 0,
  });

  console.debug("res: ");
  console.dir(res, { depth: null });
})();
