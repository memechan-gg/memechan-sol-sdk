import { sendAndConfirmTransaction } from "@solana/web3.js";
import { getAssociatedTokenAddressSync } from "@solana/spl-token";
import { VeChanStakingClient } from "../../src/vechan-vesting/VeChanStakingClient";
import { sleep, TOKEN_INFOS, VESTING_PROGRAM_ID } from "../../src";
import { connection, payer } from "../common";
import BN from "bn.js";

// yarn tsx examples/vechan-vesting/vechan-staking-example.ts > fetch.txt 2>&1
async function veChanStakingExample() {
  // Create VeChanStakingClient instance
  const client = new VeChanStakingClient(VESTING_PROGRAM_ID);
  const user = payer;

  try {
    // 1. Stake Tokens
    console.log("Preparing Stake Tokens Transaction...");
    const stakeTime = new BN(365 * 24 * 60 * 60); // 1 year in seconds
    const stakeAmount = new BN(500000000); // 0.5 tokens with 9 decimals
    const userVAcc = getAssociatedTokenAddressSync(TOKEN_INFOS.vCHAN.mint, user.publicKey);
    const userVeAcc = getAssociatedTokenAddressSync(TOKEN_INFOS.veCHAN.mint, user.publicKey);

    const { transaction: stakeTokensTx, signers: stakeTokensSigners } = await client.buildStakeTokensTransaction(
      user,
      stakeTime,
      stakeAmount,
      userVAcc,
      userVeAcc,
      null, // No vesting account in this example
    );

    console.log("Sending Stake Tokens Transaction...");
    const stakeTokensTxId = await sendAndConfirmTransaction(connection, stakeTokensTx, stakeTokensSigners);
    console.log("Tokens staked. Transaction ID:", stakeTokensTxId);

    // Store the stake public key for unstaking later
    const stakePublicKey = stakeTokensSigners[1].publicKey;

    // Wait for a while before unstaking
    console.log("Waiting for 5 seconds before unstaking...");
    await sleep(5000);

    // 2. Unstake Tokens
    console.log("\nPreparing Unstake Tokens Transaction...");
    const { transaction: unstakeTokensTx, signers: unstakeTokensSigners } = await client.buildUnstakeTokensTransaction(
      user,
      stakePublicKey,
    );

    console.log("Sending Unstake Tokens Transaction...");
    const unstakeTokensTxId = await sendAndConfirmTransaction(connection, unstakeTokensTx, unstakeTokensSigners);
    console.log("Tokens unstaked. Transaction ID:", unstakeTokensTxId);
  } catch (error) {
    console.error("An error occurred:", error);
  }
}

// Run the example
veChanStakingExample().then(() => console.log("Example completed"));
