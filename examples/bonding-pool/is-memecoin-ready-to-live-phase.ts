import { PublicKey } from "@solana/web3.js";
import { BoundPoolClient } from "../../src/bound-pool/BoundPoolClient";
import { createMemeChanClient } from "../common";

// yarn tsx examples/bonding-pool/is-memecoin-ready-to-live-phase.ts
(async () => {
  const poolAccountAddressId = new PublicKey("HFpBiAWW3uJ3rdT6SvT4xo9A2Pi2uAhNjNnNLmbxjG94");
  const client = await createMemeChanClient();

  const boundPoolInstance = await BoundPoolClient.fromBoundPoolId({ client, poolAccountAddressId });

  const res = await boundPoolInstance.isMemeCoinReadyToLivePhase();

  console.debug("res: ");
  console.dir(res, { depth: null });

  // console.debug("res: ");
  // console.dir(res.toJSON(), { depth: null });
})();
