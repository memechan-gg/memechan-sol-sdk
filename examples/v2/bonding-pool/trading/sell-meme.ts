import { PublicKey } from "@solana/web3.js";
import { client, clientV2, payer } from "../../../common";
import { getBoundPoolClientFromId } from "../../../../src/util/poolHelpers/getBoundPoolClientFromId";

// yarn tsx examples/v2/bonding-pool/trading/sell-meme.ts
(async () => {
  const poolAccountAddressId = new PublicKey("2xF1NGbLi4o9y8N1r6nReQXVfCVqThDTWNoraSbahevx");
  const boundPoolInstance = await getBoundPoolClientFromId(poolAccountAddressId, client, clientV2);

  const inputAmount = "59401500";

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
