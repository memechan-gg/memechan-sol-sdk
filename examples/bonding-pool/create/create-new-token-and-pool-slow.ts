import { BoundPoolClient } from "../../../src/bound-pool/BoundPool";
import { MEMECHAN_QUOTE_TOKEN } from "../../../src/config/config";
import { admin, payer, client, DUMMY_TOKEN_METADATA } from "../../common";

// yarn tsx examples/bonding-pool/create/create-new-token-and-pool-slow.ts > log.txt 2>&1
export const createNewTokenAndPoolSlow = async () => {
  const boundPool = await BoundPoolClient.slowNew({
    admin,
    payer,
    client,
    quoteToken: MEMECHAN_QUOTE_TOKEN,
    tokenMetadata: DUMMY_TOKEN_METADATA,
  });
  console.log("boundPool:", boundPool);
};

createNewTokenAndPoolSlow();
