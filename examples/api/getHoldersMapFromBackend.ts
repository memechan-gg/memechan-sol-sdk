import { PublicKey } from "@solana/web3.js";
import { BoundPoolClient } from "../../src/bound-pool/BoundPoolClient";
import { client } from "../common";
import { TokenApiHelper } from "../../src/api/helpers/TokenApiHelper";
import { PROD_BE_URL, StakingPoolClient } from "../../src";

// yarn tsx examples/api/getHoldersMapFromBackend.ts > getHoldersMapFromBackend.txt 2>&1

export async function getHoldersMapFromBackend() {
  const boundPoolAddress = new PublicKey("3KzDGG71bzzZUApLNukyqVPZs4EJBd6SpJMh6ze6SDp2");

  const holdersMap = await BoundPoolClient.getHoldersMap(boundPoolAddress, client);
  console.log("holdersMap:", holdersMap);

  const tokenAddress = new PublicKey("3k4cMd1JJiPbUix8KwX3TfupWuEbZgyM6q44HUGJ8mDs");
  const beHoldersMap = await TokenApiHelper.getBondingPoolHoldersMap(tokenAddress, PROD_BE_URL);
  console.log("bound pool beHoldersMap:", beHoldersMap);

  // ========================================

  const liveTokenAddress = new PublicKey("Cq7tKjeic5c4YFZPsvCskGQRYCqGbyGMVjqL1ud1hVaL");
  const stakingPoolBoundPoolAddress = new PublicKey("6e6pTCq5AB6zrXVWgBGSL9F6fkiNc2tmGca9L2bmt7xQ");

  const stakingPoolAddress = BoundPoolClient.findStakingPda(liveTokenAddress, client.memechanProgram.programId);
  console.log("stakingPoolId:", stakingPoolAddress.toBase58());

  const stakingHoldersList = await StakingPoolClient.getHoldersList(
    stakingPoolBoundPoolAddress,
    liveTokenAddress,
    client,
  );
  console.log("staking pool holders list:", stakingHoldersList);

  const liveBeHoldersMap = await TokenApiHelper.getStakingPoolHoldersList(
    liveTokenAddress,
    stakingPoolAddress,
    client.memechanProgram.programId,
    PROD_BE_URL,
  );
  console.log("staking pool beHoldersMap:", liveBeHoldersMap);
}

getHoldersMapFromBackend();
