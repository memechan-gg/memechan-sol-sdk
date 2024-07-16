import { PublicKey } from "@solana/web3.js";
import { BoundPoolClientV2 } from "../../../../src/bound-pool/BoundPoolClientV2";
import { createMemeChanClientV2 } from "../../../common";

// yarn tsx examples/v2/bonding-pool/from/bound-pool-from-pool-id.ts
(async () => {
  const poolAccountAddressId = new PublicKey("6TkQRjeeBeFtpFyfi8ruREYWo5vJSMCHuJaozKhCTdb2");
  const clientV2 = await createMemeChanClientV2();

  const boundPoolInstance = await BoundPoolClientV2.fromBoundPoolId({ client: clientV2, poolAccountAddressId });

  console.debug("boundPoolInstance: ", boundPoolInstance);
  console.debug("boundPoolInstance.isMemeCoinReadyToLivePhase: ", await boundPoolInstance.isMemeCoinReadyToLivePhase());
})();
