import { PublicKey } from "@solana/web3.js";
import { BoundPoolClient } from "../../../src/bound-pool/BoundPool";
import { client, payer } from "../../common";

// yarn tsx examples/bonding-pool/trading/buy-meme.ts
(async () => {
  const poolAccountAddressId = new PublicKey("HFpBiAWW3uJ3rdT6SvT4xo9A2Pi2uAhNjNnNLmbxjG94");
  const boundPoolInstance = await BoundPoolClient.fromBoundPoolId({ client, poolAccountAddressId });

  // console.debug("payer: ", payer);
  // console.debug("payer.publicKey: ", payer.publicKey.toString());
  // console.debug("payer.secretKey: ", payer.secretKey);

  // const res = await boundPoolInstance.getOutputAmountForBuyMeme({
  //   inputAmount: "100",
  //   slippagePercentage: 0,
  //   user: payer.publicKey,
  //   signer: payer,
  // });

  const res = await boundPoolInstance.buyMeme({
    inputAmount: "100",
    minOutputAmount: "0",
    slippagePercentage: 0,
    user: payer.publicKey,
    signer: payer,
  });

  console.debug("res: ");
  console.dir(res, { depth: null });
})();
