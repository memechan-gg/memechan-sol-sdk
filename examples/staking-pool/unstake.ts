import { PublicKey } from "@solana/web3.js";
import { MemeTicket } from "../../src/memeticket/MemeTicket";
import { StakingPool as CodegenStakingPool } from "../../src/schema/codegen/accounts";
import { StakingPool } from "../../src/staking-pool/StakingPool";
import { client, connection, payer } from "../common";
import { BN } from "bn.js";

// yarn tsx examples/staking-pool/unstake.ts > unstake.txt 2>&1
export const unstake = async () => {
  try {
    const boundPoolAddress = new PublicKey("B36EwUzBiZqLeKTwJrwPNbwfJaPRwfKcbCyHPLix3xF9");
    const stakingPoolAddress = new PublicKey("EeckpiLcg6FZLkjSR31wf9Z8VZUhyWncB5x4Hks5A8ve");

    // Get staking pool
    const stakingPool = await StakingPool.fromStakingPoolId({ client, poolAccountAddressId: stakingPoolAddress });
    const fetchedStakingPool = await CodegenStakingPool.fetch(connection, stakingPoolAddress);
    console.log("fetchedStakingPool:", fetchedStakingPool?.toJSON());

    if (fetchedStakingPool === null) {
      throw new Error("[getAvailableUnstakeAmount] No staking pool found.");
    }

    // Get all user tickets
    const { tickets } = await MemeTicket.fetchAvailableTicketsByUser(boundPoolAddress, client, payer.publicKey);
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
    const destinationMemeTicket = new MemeTicket(destinationTicket.id, client);

    if (sourceTickets.length > 0) {
      const sourceMemeTickets = sourceTickets.map((ticket) => new MemeTicket(ticket.id, client));

      await destinationMemeTicket.stakingMerge({
        staking: stakingPoolAddress,
        ticketsToMerge: sourceMemeTickets,
        user: payer,
      });

      console.log("[unstake] All the tickets are merged.");
    } else {
      console.log("[unstake] Nothing to merge, only one ticket available.");
    }

    // Unstake
    await stakingPool.unstake({ amount: new BN(amount), user: payer, ticket: destinationMemeTicket });
  } catch (e) {
    console.error("[unstake] Error:", e);
  }
};

unstake();
