import { PublicKey, sendAndConfirmTransaction } from "@solana/web3.js";
import { StakingPool as CodegenStakingPool } from "../../src/schema/codegen/accounts";
import { client, connection, payer } from "../common";
import { BN } from "bn.js";
import { MemeTicketClient, StakingPoolClient } from "../../src";

// yarn tsx examples/staking-pool/unstake-tx.ts > unstake-tx.txt 2>&1
export const unstake = async () => {
  try {
    const boundPoolAddress = new PublicKey("4FjqPg6rcp9W5nfNh5SiCaSv9mqbnn3h7AJ4y6TFPMnf");
    const stakingPoolAddress = new PublicKey("EWuDJ1xifbipiDRm5mwgoGEwY4qFH6ApFT6PMet98Qfc");

    // Get staking pool
    const stakingPool = await StakingPoolClient.fromStakingPoolId({ client, poolAccountAddressId: stakingPoolAddress });
    const fetchedStakingPool = await CodegenStakingPool.fetch(connection, stakingPoolAddress);
    console.log("fetchedStakingPool:", fetchedStakingPool?.toJSON());

    if (fetchedStakingPool === null) {
      throw new Error("[getAvailableUnstakeAmount] No staking pool found.");
    }

    // Get all user tickets
    const { tickets } = await MemeTicketClient.fetchAvailableTicketsByUser(boundPoolAddress, client, payer.publicKey);
    console.log("tickets:", tickets);

    if (tickets.length === 0) {
      console.log("[unstake] There is no tickets.");
      return;
    }

    // Get available unstake amount
    const amount = await stakingPool.getAvailableUnstakeAmount({
      tickets: tickets.map((ticket) => ticket.fields),
      stakingPoolVestingConfig: fetchedStakingPool.vestingConfig,
    });
    console.log("amount:", amount);

    // Merge all the tickets into one, because `unstake` method receives only one ticket
    const [destinationTicket, ...sourceTickets] = tickets;
    const destinationMemeTicket = new MemeTicketClient(destinationTicket.id, client);

    if (sourceTickets.length > 0) {
      const sourceMemeTickets = sourceTickets.map((ticket) => new MemeTicketClient(ticket.id, client));

      await destinationMemeTicket.stakingMerge({
        staking: stakingPoolAddress,
        ticketsToMerge: sourceMemeTickets,
        user: payer.publicKey,
        signer: payer,
      });

      console.log("[unstake] All the tickets are merged.");
    } else {
      console.log("[unstake] Nothing to merge, only one ticket available.");
    }

    console.log("[unstake] Unstaking...");

    // Unstake
    const { transaction, memeAccountKeypair, quoteAccountKeypair } = await stakingPool.getUnstakeTransaction({
      amount: new BN(amount),
      user: payer.publicKey,
      ticket: destinationMemeTicket,
    });

    console.log("payer: " + payer.publicKey.toBase58());
    const signature = await sendAndConfirmTransaction(
      client.connection,
      transaction,
      [payer, memeAccountKeypair, quoteAccountKeypair],
      { commitment: "confirmed", skipPreflight: true, preflightCommitment: "confirmed" },
    );
    console.log("unstake signature:", signature);
  } catch (e) {
    console.error("[unstake] Error:", e);
  }
};

unstake();
