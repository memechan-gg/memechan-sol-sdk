import { PublicKey } from "@solana/web3.js";
import { clientV2 } from "../../../common";
import { BoundPoolClientV2 } from "../../../../src/bound-pool/BoundPoolClientV2";

// yarn tsx examples/v2/bonding-pool/from/bound-pool-from-pool-id.ts
(async () => {
  const poolAccountAddressId = new PublicKey("CRFfpjcEdhm7Q24bnyj81jTjWgipraNkrquGdkFUmmqY");
  const boundPoolInstance = await BoundPoolClientV2.fromBoundPoolId({ client: clientV2, poolAccountAddressId });

  console.debug("boundPoolInstance: ", boundPoolInstance);
  console.debug("boundPoolInstance.isMemeCoinReadyToLivePhase: ", await boundPoolInstance.isMemeCoinReadyToLivePhase());
})();
