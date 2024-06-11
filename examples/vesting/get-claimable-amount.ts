import { PublicKey } from "@solana/web3.js";
import { VestingClient } from "../../src/vesting/VestingClient";
import { Vesting } from "../../src/vesting/schema/codegen/accounts";
import { client } from "../common";

// yarn tsx examples/vesting/get-claimable-amount.ts

async function getClaimableAmount() {
  const vestingId = new PublicKey("HBUb4h54cFG9gtCU2y3RoRxkFz1Vnh8VStxPo7oRTGr9");
  const vesting = await Vesting.fetch(client.connection, vestingId);

  const amount = VestingClient.getVestingClaimableAmount({ vesting: vesting! });

  console.log(`claimable amt: ${amount}`);
}

getClaimableAmount();
