import { PublicKey } from "@solana/web3.js";
import { client, clientV2 } from "../../common";
import { getLivePoolClientFromId } from "../../../src";

// yarn tsx examples/v2/live-pool/live-pool-from-pool-id.ts
(async () => {
  const livePoolId = new PublicKey("AYiNs7jiSsPvGEjqME5JaYw6y11fQjDJH7a4cp6A1AJX");
  const livePoolClient = getLivePoolClientFromId(livePoolId, client, clientV2);

  console.debug("livePoolClient: ", livePoolClient);
})();
