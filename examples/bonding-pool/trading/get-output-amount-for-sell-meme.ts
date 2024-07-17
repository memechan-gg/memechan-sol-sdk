import { PublicKey } from "@solana/web3.js";
import { BoundPoolClient } from "../../../src/bound-pool/BoundPoolClient";
import { client } from "../../common";

// yarn tsx examples/bonding-pool/trading/get-output-amount-for-sell-meme.ts
(async () => {
  const poolAccountAddressId = new PublicKey("7y7g19JdRaTNhSChuiXBoujAzkCCPDZeFFa4XWLU1oE1");
  const boundPoolInstance = await BoundPoolClient.fromBoundPoolId({ client, poolAccountAddressId });

  const res = await boundPoolInstance.getOutputAmountForSellMeme({
    inputAmount: "1000000",
    slippagePercentage: 0,
  });

  console.debug("res: ");
  console.dir(res, { depth: null });
})();
