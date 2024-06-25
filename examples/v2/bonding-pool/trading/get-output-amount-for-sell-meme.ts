import { PublicKey } from "@solana/web3.js";
import { client, clientV2 } from "../../../common";
import { getBoundPoolClientFromId } from "../../../../src/util/getBoundPoolClientFromId";

// yarn tsx examples/v2/bonding-pool/trading/get-output-amount-for-sell-meme.ts
(async () => {
  const poolAccountAddressId = new PublicKey("2xF1NGbLi4o9y8N1r6nReQXVfCVqThDTWNoraSbahevx");
  const boundPoolInstance = await getBoundPoolClientFromId(poolAccountAddressId, client, clientV2);

  const res = await boundPoolInstance.getOutputAmountForSellMeme({
    inputAmount: "59401500",
    slippagePercentage: 0,
  });

  console.debug("res: ");
  console.dir(res, { depth: null });
})();
