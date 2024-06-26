import { BoundPoolClientV2 } from "../../../../src";
import { BoundPoolClient } from "../../../../src/bound-pool/BoundPoolClient";
import { client, clientV2 } from "../../../common";

// yarn tsx examples/v2/bonding-pool/from/bound-pool-from-tx-signature.ts
(async () => {
  const poolCreationSignature =
    "2WNnCruzpP7EQcaHgyFvaNkModaW4VKvjCLVarSSPDYfAKpEs2pjmq15foeuN9vPVtnwre4e7oPVbv36x7VCB7sP";
  const boundPoolInstance = await BoundPoolClientV2.fromPoolCreationTransaction({
    client: clientV2,
    poolCreationSignature,
  });

  console.debug("boundPoolInstance: ", boundPoolInstance.id.toString());
})();
