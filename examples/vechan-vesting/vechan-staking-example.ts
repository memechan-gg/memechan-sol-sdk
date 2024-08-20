import { sendAndConfirmTransaction } from "@solana/web3.js";
import { getAssociatedTokenAddressSync, TOKEN_2022_PROGRAM_ID, TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { VeChanStakingClient } from "../../src/vechan-vesting/VeChanStakingClient";
import { getUserStakeSigner, sleep, TOKEN_INFOS, VESTING_PROGRAM_ID } from "../../src";
import { connection, payer } from "../common";
import BN from "bn.js";

// yarn tsx examples/vechan-vesting/vechan-staking-example.ts > fetch.txt 2>&1
async function veChanStakingExample() {
  // Create VeChanStakingClient instance
  const client = new VeChanStakingClient(VESTING_PROGRAM_ID);
  const user = payer;

  console.log("VESTING_PROGRAM_ID:", VESTING_PROGRAM_ID.toBase58());
  console.log("vCHAN Mint:", TOKEN_INFOS.vCHAN.mint.toBase58());
  console.log("VeCHAN Mint: ", TOKEN_INFOS.veCHAN.mint.toBase58());

  console.log("User public key:", user.publicKey.toBase58());

  try {
    // 1. Stake Tokens
    console.log("Preparing Stake Tokens Transaction...");
    const stakeTime = new BN(3); // 3 seconds
    const stakeAmount = new BN(500000000); // 0.5 tokens with 9 decimals
    const userVAcc = getAssociatedTokenAddressSync(TOKEN_INFOS.vCHAN.mint, user.publicKey, false, TOKEN_PROGRAM_ID);

    console.log("User vAcc:", userVAcc.toBase58());

    const userVeAcc = getAssociatedTokenAddressSync(
      TOKEN_INFOS.veCHAN.mint,
      user.publicKey,
      false,
      TOKEN_2022_PROGRAM_ID,
    );

    console.log("User veAcc:", userVeAcc.toBase58());

    const { transaction: stakeTokensTx, stake } = await client.buildStakeTokensTransaction(
      stakeTime,
      stakeAmount,
      user.publicKey,
      userVAcc,
      userVeAcc,
      null, // No vesting account in this example
    );

    console.log("Stake public key:", stake.publicKey.toBase58());
    const stakeSigner = getUserStakeSigner(stake.publicKey);
    console.log("Stake signer:", stakeSigner.toBase58());
    const vault = getAssociatedTokenAddressSync(TOKEN_INFOS.vCHAN.mint, stakeSigner, true);
    console.log("Vault:", vault.toBase58());

    console.log("Sending Stake Tokens Transaction...");
    const stakeTokensTxId = await sendAndConfirmTransaction(connection, stakeTokensTx, [payer, stake], {
      commitment: "confirmed",
      // skipPreflight: true,
    });
    console.log("Tokens staked. Transaction ID:", stakeTokensTxId);

    // Wait for a while before unstaking
    console.log("Waiting for 5 seconds before unstaking...");
    await sleep(5000);

    // 2. Unstake Tokens
    console.log("\nPreparing Unstake Tokens Transaction...");
    const unstakeTokensTx = await client.buildUnstakeTokensTransaction(user.publicKey, stake.publicKey);

    console.log("Sending Unstake Tokens Transaction...");
    const unstakeTokensTxId = await sendAndConfirmTransaction(connection, unstakeTokensTx, [payer]);
    console.log("Tokens unstaked. Transaction ID:", unstakeTokensTxId);
  } catch (error) {
    console.error("An error occurred:", error);
  }
}

// Run the example
veChanStakingExample().then(() => console.log("Example completed"));
