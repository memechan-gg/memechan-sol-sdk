import { PublicKey } from "@solana/web3.js";
import { BoundPoolClient } from "../../../../src/bound-pool/BoundPoolClient";
import { client } from "../../../common";

// yarn tsx examples/bonding-pool/from/bound-pool-from-pool-id.ts
(async () => {
  const poolAccountAddressId = new PublicKey("36mKVMP9gmZp2pn8UQQXHFUcpCVFTAQ5Hr4fGNw3s7Nj");
  const boundPoolInstance = await BoundPoolClient.fromBoundPoolId({ client, poolAccountAddressId });

  console.debug("boundPoolInstance: ", boundPoolInstance.id.toString());
})();
