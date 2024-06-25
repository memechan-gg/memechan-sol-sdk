import { PublicKey } from "@solana/web3.js";
import { client, clientV2 } from "../../../common";
import { getBoundPoolClientFromId } from "../../../../src/util/getBoundPoolClientFromId";

// yarn tsx examples/v2/bonding-pool/trading/get-output-amount-for-buy-meme.ts
(async () => {
  const poolAccountAddressId = new PublicKey("2xF1NGbLi4o9y8N1r6nReQXVfCVqThDTWNoraSbahevx");
  const boundPoolInstance = await getBoundPoolClientFromId(poolAccountAddressId, client, clientV2);

  const res = await boundPoolInstance.getOutputAmountForBuyMeme({
    inputAmount: "0.001",
    slippagePercentage: 0,
  });

  console.debug("getOutputAmountForBuyMeme: ");
  console.dir(res, { depth: null });
})();
