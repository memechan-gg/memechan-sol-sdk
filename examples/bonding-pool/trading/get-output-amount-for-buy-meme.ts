import { PublicKey } from "@solana/web3.js";
import { BoundPoolClient } from "../../../src/bound-pool/BoundPoolClient";
import { client } from "../../common";

// yarn tsx examples/bonding-pool/trading/get-output-amount-for-buy-meme.ts
(async () => {
  const poolAccountAddressId = new PublicKey("8T83gG397gcCaFh8hLiMECmhrmkLS7vtptMeLvCgwKde");
  const boundPoolInstance = await BoundPoolClient.fromBoundPoolId({ client, poolAccountAddressId });

  const res = await boundPoolInstance.getOutputAmountForBuyMeme({
    inputAmount: "1",
    slippagePercentage: 0,
  });

  console.debug("res: ");
  console.dir(res, { depth: null });
})();
