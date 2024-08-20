import { Keypair, sendAndConfirmTransaction } from "@solana/web3.js";
import { BN } from "@coral-xyz/anchor";
import { getAssociatedTokenAddressSync } from "@solana/spl-token";
import { VeChanStakingClient } from "../../src/vechan-vesting/VeChanStakingClient";
import { sleep, TOKEN_INFOS } from "../../src";
import { clientV2, connection } from "../common";

// yarn tsx examples/vechan-vesting/vechan-staking-example.ts > fetch.txt 2>&1
async function veChanStakingExample() {
  // Create VeChanStakingClient instance
  const client = new VeChanStakingClient(clientV2.memechanProgram.programId);

  // Example user
  const user = Keypair.generate();

  // Airdrop some SOL to the user for transaction fees
  const airdropSignature = await connection.requestAirdrop(user.publicKey, 1000000000);
  await connection.confirmTransaction(airdropSignature);

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
