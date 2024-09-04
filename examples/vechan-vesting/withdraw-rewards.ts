import { NATIVE_MINT } from "@solana/spl-token";
import {
  getRewardStatePDA,
  getStakingStatePDA,
  getUserRewardsPDA,
  VeChanStakingClient,
  VESTING_PROGRAM_ID,
} from "../../src";
import { UserRewards, UserStake } from "../../src/vechan-vesting/schema/codegen/accounts";
import { connection, payer } from "../common";
import { AnchorProvider, Wallet } from "@coral-xyz/anchor";
import { PublicKey, sendAndConfirmTransaction } from "@solana/web3.js";

// yarn tsx examples/vechan-vesting/fetch-userstake.ts
(async () => {
  const user = new PublicKey("J6dVHbVHiJXb46cSt2XdtAoTTt9NFD8yy889UAEdutf6");

  const client = new VeChanStakingClient(
    new PublicKey("vestJGg7ZMQoXiAr2pLV5cqgtxFhEWzNoZL5Ngzb8H4"),
    new AnchorProvider(connection, new Wallet(payer), { commitment: "confirmed" }),
  );

  console.log("user:", user.toBase58());
  const userStakes = await client.fetchStakesForUser(user);
  console.log("User Stakes:", userStakes);

  const userRewards = await client.fetchUserRewardsForStakes(userStakes.map((el) => el.address));
  console.log("User Rewards:", userRewards);

  const rewards = await client.fetchRewards();

  const mappedUserStakes = new Map<string, UserStake>();
  for (const userStake of userStakes) {
    mappedUserStakes.set(userStake.address.toString(), userStake.data);
  }

  const withdrawRewardTxes = [];
  for (const userReward of userRewards) {
    const stake = mappedUserStakes.get(userReward.stakeAddress.toString())!;
    const eligible = VeChanStakingClient.getEligibleRewardNumbers(rewards, stake, userReward.data!);
    if (eligible.length != 0) {
      const tx = await client.buildWithdrawRewardTransaction(
        user,
        userReward.stakeAddress,
        userReward.address,
        eligible[0],
      );

      for (let i = eligible[0] + 1; i < eligible.length; i++) {
        tx.add(await client.getWithdrawRewardInstuction(user, userReward.stakeAddress, userReward.address, i));
      }

      withdrawRewardTxes.push(tx);
    }
  }

  for (const tx of withdrawRewardTxes) {
    console.log("Sending Stake Tokens Transaction...");
    const stakeTokensTxId = await sendAndConfirmTransaction(connection, tx, [payer], {
      commitment: "confirmed",
      // skipPreflight: true,
    });
    console.log("Tokens staked. Transaction ID:", stakeTokensTxId);
  }
})();
