import { getConfig } from "../../../src";
import { BoundPoolClient } from "../../../src/bound-pool/BoundPoolClient";
import { createMemeChanClient, DUMMY_TOKEN_METADATA, payer } from "../../common";

// yarn tsx examples/bonding-pool/create/create-new-token-and-pool.ts > log.txt 2>&1
export const createNewTokenAndPool = async () => {
  const client = await createMemeChanClient();
  const { TOKEN_INFOS, ADMIN_PUB_KEY: admin } = await getConfig();;

  const boundPool = await BoundPoolClient.new({
    admin,
    payer,
    client,
    quoteToken: TOKEN_INFOS.WSOL,
    tokenMetadata: DUMMY_TOKEN_METADATA,
  });
  console.log("boundPool:", boundPool);
  console.log("boundPool:", boundPool.id.toString());
};

createNewTokenAndPool();
