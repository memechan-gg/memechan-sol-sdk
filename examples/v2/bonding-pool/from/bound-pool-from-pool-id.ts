import { PublicKey } from "@solana/web3.js";
import { clientV2 } from "../../../common";
import { BoundPoolClientV2 } from "../../../../src/bound-pool/BoundPoolClientV2";

// yarn tsx examples/v2/bonding-pool/from/bound-pool-from-pool-id.ts
(async () => {
  const poolAccountAddressId = new PublicKey("HFpBiAWW3uJ3rdT6SvT4xo9A2Pi2uAhNjNnNLmbxjG94");
  const boundPoolInstance = await BoundPoolClientV2.fromBoundPoolId({ client: clientV2, poolAccountAddressId });

  console.debug("boundPoolInstance: ", boundPoolInstance.id.toString());
})();
