import { PublicKey } from "@solana/web3.js";
import { BoundPoolClient } from "../../src/bound-pool/BoundPoolClient";
import { client } from "../common";
import { TokenApiHelper } from "../../src/api/TokenApiHelper";

// yarn tsx examples/bonding-pool/getHoldersMapFromBackend.ts > getHoldersMapFromBackend.txt 2>&1

export async function getHoldersMapFromBackend() {
  const poolAddress = new PublicKey("3KzDGG71bzzZUApLNukyqVPZs4EJBd6SpJMh6ze6SDp2");

  const holdersMap = await BoundPoolClient.getHoldersMap(poolAddress, client);
  console.log("holdersMap:", holdersMap);

  const tokenAddress = new PublicKey("3k4cMd1JJiPbUix8KwX3TfupWuEbZgyM6q44HUGJ8mDs");
  const beHoldersMap = await TokenApiHelper.getHoldersMapFromBackend(tokenAddress);
  console.log("beHoldersMap:", beHoldersMap);
}

getHoldersMapFromBackend();
