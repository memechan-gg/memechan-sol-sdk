import { PublicKey } from "@solana/web3.js";
import { BoundPoolClient } from "../../src/bound-pool/BoundPoolClient";
import { client } from "../common";
import { TokenApiHelper } from "../../src/api/TokenApiHelper";
import { StakingPoolClient } from "../../src";

// yarn tsx examples/bonding-pool/getHoldersMapFromBackend.ts > getHoldersMapFromBackend.txt 2>&1

export async function getHoldersMapFromBackend() {
  const boundPoolAddress = new PublicKey("3KzDGG71bzzZUApLNukyqVPZs4EJBd6SpJMh6ze6SDp2");

  const holdersMap = await BoundPoolClient.getHoldersMap(boundPoolAddress, client);
  console.log("holdersMap:", holdersMap);

  const tokenAddress = new PublicKey("3k4cMd1JJiPbUix8KwX3TfupWuEbZgyM6q44HUGJ8mDs");
  const beHoldersMap = await TokenApiHelper.getHoldersMapFromBackend(tokenAddress);
  console.log("bound pool beHoldersMap:", beHoldersMap);

  const liveTokenAddress = new PublicKey("Cq7tKjeic5c4YFZPsvCskGQRYCqGbyGMVjqL1ud1hVaL");
  const stakingPoolAddress = new PublicKey("FADx3TtbVU54daPqb7PR7RS9GmA4QuWfTizMVpupHoWy");
  const stakingHoldersList = await StakingPoolClient.getHoldersList(boundPoolAddress, liveTokenAddress, client);
  console.log("staking pool holders list:", stakingHoldersList);

  const liveBeHoldersMap = await TokenApiHelper.getHoldersMapFromBackend(liveTokenAddress);
  console.log("staking pool beHoldersMap:", liveBeHoldersMap);
}

getHoldersMapFromBackend();
