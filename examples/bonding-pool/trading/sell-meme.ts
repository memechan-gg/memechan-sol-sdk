import { PublicKey } from "@solana/web3.js";
import { BoundPoolClient } from "../../../src/bound-pool/BoundPool";
import { client, connection, payer } from "../../common";

// yarn tsx examples/bonding-pool/trading/sell-meme.ts
(async () => {
  const poolAccountAddressId = new PublicKey("HFpBiAWW3uJ3rdT6SvT4xo9A2Pi2uAhNjNnNLmbxjG94");
  const boundPoolInstance = await BoundPoolClient.fromBoundPoolId({ client, poolAccountAddressId });

  const res = await boundPoolInstance.sellMeme({
    inputAmount: "131",
    minOutputAmount: "0",
    slippagePercentage: 0,
    user: payer.publicKey,
    signer: payer,
  });

  console.debug("res: ");
  console.dir(res, { depth: null });
})();
