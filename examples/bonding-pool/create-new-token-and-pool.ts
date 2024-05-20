import { sendAndConfirmTransaction } from "@solana/web3.js";
import { BoundPool } from "../../src/bound-pool/BoundPool";
import { MEMECHAN_QUOTE_TOKEN } from "../../src/config/config";
import { admin, payer, client } from "../common";

const DUMMY_TOKEN_METADATA = {
  name: "TRUE TOKEN 20-05-2-45",
  symbol: "TRTK2005245",
  image: "https://cf-ipfs.com/ipfs/QmVevMfxFpfgBu5kHuYUPmDMaV6pWkAn3zw5XaCXxKdaBh",
  description: "This is the best token ever",
  twitter: "https://twitter.com/BestTokenEver",
  telegram: "https://t.me/BestTokenEver",
  website: "https://besttokenever.com",
};

// yarn tsx examples/bonding-pool/create-new-token-and-pool.ts > log.txt 2>&1
export const createNewTokenAndPool = async () => {
  const { transaction, memeMint } = await BoundPool.getCreateNewBondingPoolAndTokenTransaction({
    admin,
    payer,
    signer: payer,
    client,
    quoteToken: MEMECHAN_QUOTE_TOKEN,
    tokenMetadata: DUMMY_TOKEN_METADATA,
  });

  const signature = await sendAndConfirmTransaction(client.connection, transaction, [payer], {
    commitment: "confirmed",
  });
  console.log("signature:", signature);

  const id = BoundPool.findBoundPoolPda(memeMint, MEMECHAN_QUOTE_TOKEN.mint, client.memechanProgram.programId);
  const boundPool = await BoundPool.fetch2(client.connection, id);
  console.log("boundPool:", boundPool);
};

createNewTokenAndPool();
