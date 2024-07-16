import { PublicKey } from "@solana/web3.js";
import { getLivePoolClientFromId } from "../../../src";
import { createMemeChanClient, createMemeChanClientV2 } from "../../common";

// yarn tsx examples/v2/live-pool/live-pool-from-pool-id.ts
(async () => {
  const livePoolId = new PublicKey("69fywDppk1B9tXtGQJDiRKDcV8My6NLuyHgAmSToT6bZ");

  const client = await createMemeChanClient();
  const clientV2 = await createMemeChanClientV2();
  const livePoolClient = await getLivePoolClientFromId(livePoolId, client, clientV2);

  console.debug("livePoolClient: ", livePoolClient);
})();
