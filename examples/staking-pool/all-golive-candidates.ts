import { client } from "../common";
import { StakingPoolClient } from "../../src";
import { PublicKey } from "@solana/web3.js";

// yarn tsx examples/staking-pool/all-golive-candidates.ts > fetch.txt 2>&1
export async function allGoLiveCandidates() {
  const goliveCandidates = await StakingPoolClient.allGoLiveCandidates(client.memechanProgram);
  console.log("goLive candidates: ", goliveCandidates);
}

allGoLiveCandidates();
