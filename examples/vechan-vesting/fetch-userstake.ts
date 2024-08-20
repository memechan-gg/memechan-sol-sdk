import { VeChanStakingClient, VESTING_PROGRAM_ID } from "../../src";
import { connection, payer } from "../common";
import { AnchorProvider, Wallet } from "@coral-xyz/anchor";

// yarn tsx examples/vechan-vesting/fetch-userstake.ts
(async () => {
  const user = payer.publicKey;

  const client = new VeChanStakingClient(
    VESTING_PROGRAM_ID,
    new AnchorProvider(connection, new Wallet(payer), { commitment: "confirmed" }),
  );

  console.log("user:", user.toBase58());
  const userStakes = await client.fetchStakesForUser(user);
  console.log("User Stakes:", userStakes);

  const rewards = await client.fetchRewardsForUserStakes(userStakes.map((el) => el.address));
  console.log("User Rewards:", rewards);
})();
