import { BoundPoolClient } from "../../../src/bound-pool/BoundPool";
import { MEMECHAN_QUOTE_TOKEN } from "../../../src/config/config";
import { DUMMY_TOKEN_METADATA, admin, client, payer } from "../../common";

// yarn tsx examples/bonding-pool/create/create-new-token-and-pool.ts > log.txt 2>&1
export const createNewTokenAndPool = async () => {
  const boundPool = await BoundPoolClient.new({
    admin,
    payer,
    client,
    quoteToken: MEMECHAN_QUOTE_TOKEN,
    tokenMetadata: DUMMY_TOKEN_METADATA,
  });
  console.log("boundPool:", boundPool);
  console.log("boundPool:", boundPool.id.toString());
};

createNewTokenAndPool();
