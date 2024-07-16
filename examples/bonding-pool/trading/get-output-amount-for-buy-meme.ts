import { PublicKey } from "@solana/web3.js";
import { BoundPoolClient } from "../../../src/bound-pool/BoundPoolClient";
import { createMemeChanClient } from "../../common";

// yarn tsx examples/bonding-pool/trading/get-output-amount-for-buy-meme.ts
(async () => {
  const poolAccountAddressId = new PublicKey("7y7g19JdRaTNhSChuiXBoujAzkCCPDZeFFa4XWLU1oE1");
  const client = await createMemeChanClient();

  const boundPoolInstance = await BoundPoolClient.fromBoundPoolId({ client, poolAccountAddressId });

  const res = await boundPoolInstance.getOutputAmountForBuyMeme({
    inputAmount: "312",
    slippagePercentage: 0,
  });

  console.debug("res: ");
  console.dir(res, { depth: null });
})();
