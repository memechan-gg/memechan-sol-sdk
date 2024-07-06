import { PublicKey } from "@solana/web3.js";
import { client, clientV2 } from "../../common";
import { getLivePoolClientFromId } from "../../../src";

// yarn tsx examples/v2/live-pool/live-pool-from-pool-id.ts
(async () => {
  const livePoolId = new PublicKey("69fywDppk1B9tXtGQJDiRKDcV8My6NLuyHgAmSToT6bZ");
  const livePoolClient = getLivePoolClientFromId(livePoolId, client, clientV2);

  console.debug("livePoolClient: ", livePoolClient);
})();
