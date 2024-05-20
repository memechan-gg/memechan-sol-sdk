import { BoundPool } from "../../src/bound-pool/BoundPool";
import { MEMECHAN_QUOTE_TOKEN } from "../../src/config/config";
import { admin, payer, client } from "../common";

const DUMMY_TOKEN_METADATA = {
  name: "Best Token Ever",
  symbol: "BTE",
  image: "https://cf-ipfs.com/ipfs/QmVevMfxFpfgBu5kHuYUPmDMaV6pWkAn3zw5XaCXxKdaBh",
  description: "This is the best token ever",
  twitter: "https://twitter.com/BestTokenEver",
  telegram: "https://t.me/BestTokenEver",
  website: "https://besttokenever.com",
};

// yarn tsx examples/bonding-pool/create-new-token-and-pool.ts > log.txt 2>&1
export const createNewTokenAndPool = async () => {
  const boundPool = await BoundPool.slowNew({
    admin,
    payer,
    signer: payer,
    client,
    quoteToken: MEMECHAN_QUOTE_TOKEN,
    tokenMetadata: DUMMY_TOKEN_METADATA,
  });
  console.log("boundPool:", boundPool);
};

createNewTokenAndPool();
