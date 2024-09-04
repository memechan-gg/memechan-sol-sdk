import { PublicKey } from "@solana/web3.js";
import { VeChanStakingClient, VESTING_PROGRAM_ID } from "../../src";
import { connection, payer } from "../common";
import { AnchorProvider, Wallet } from "@coral-xyz/anchor";

// yarn tsx examples/vechan-vesting/fetch-userstake.ts
(async () => {
  const user = new PublicKey("97e7Mbpgmj95iAP5EbZWAG3Wqqmyo7LLZrVW1fKxezL3");

  const client = new VeChanStakingClient(
    VESTING_PROGRAM_ID,
    new AnchorProvider(connection, new Wallet(payer), { commitment: "confirmed" }),
  );

  console.log("user:", user.toBase58());
  const userStakes = await client.fetchStakesForUser(user);
  console.log("User Stakes:", userStakes);

  const rewards = await client.fetchUserRewardsForStakes(userStakes.map((el) => el.address));
  console.log("User Rewards:", rewards);
})();

// import { PublicKey } from "@solana/web3.js";
// import { VeChanStakingClient, VESTING_PROGRAM_ID } from "../../src";
// import { connection, payer } from "../common";
// import { AnchorProvider, Wallet } from "@coral-xyz/anchor";

// // yarn tsx examples/vechan-vesting/fetch-userstake.ts
// (async () => {
//   const user = new PublicKey("5W22DiXpW1x4s2FKQpDpiai7BfCHzywcyiKWeYJjmwSx");

//   const client = new VeChanStakingClient(
//     new PublicKey("4JDLXnMpPN129YHbGTwn16hW6xt2QgkfdYPMAgMQAcV5"),
//     new AnchorProvider(connection, new Wallet(payer), { commitment: "confirmed" }),
//   );

//   console.log("user:", user.toBase58());
//   const userStakes = await client.fetchStakesForUser(user);
//   console.log("User Stakes:", userStakes);

//   const rewards = await client.fetchUserRewardsForStakes(userStakes.map((el) => el.address));
//   console.log("User Rewards:", rewards);
// })();
