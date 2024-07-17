import { PublicKey } from "@solana/web3.js";
import { StakingPool as CodegenStakingPool } from "../../../src/schema/v2/codegen/accounts/StakingPool";
import { BN } from "bn.js";
import { clientV2, connection, payer } from "../../common";
import { MemeTicketClientV2, StakingPoolClientV2 } from "../../../src";

// yarn tsx examples/staking-pool/unstake.ts > unstake.txt 2>&1
export const unstake = async () => {
  try {
    const boundPoolAddress = new PublicKey("2paxDkj5zFR3DtMVZtmTSbkMYZwFtVZnq2Xv1WFHqgPo");
    const stakingPoolAddress = new PublicKey("sh5hozk6bENHvG4J5zrqW2S5eKjp68DRPZodCRLSkJU");

    // Get staking pool
    const stakingPool = await StakingPoolClientV2.fromStakingPoolId({
      client: clientV2,
      poolAccountAddressId: stakingPoolAddress,
    });
    const fetchedStakingPool = await CodegenStakingPool.fetch(connection, stakingPoolAddress);
    console.log("fetchedStakingPool:", fetchedStakingPool?.toJSON());

    if (fetchedStakingPool === null) {
      throw new Error("[getAvailableUnstakeAmount] No staking pool found.");
    }

    // Get all user tickets
    const { tickets } = await MemeTicketClientV2.fetchAvailableTicketsByUser2(
      boundPoolAddress,
      clientV2,
      payer.publicKey,
    );
    console.log("tickets:", tickets);

    if (tickets.length === 0) {
      console.log("[unstake] There is no tickets.");
      return;
    }

    // Get available unstake amount
    const availableAmount = await stakingPool.getAvailableUnstakeAmount({
      tickets: tickets.map((ticket) => ticket.fields),
      stakingPoolVestingConfig: fetchedStakingPool.vestingConfig,
    });
    console.log("availableAmount:", availableAmount);

    // Merge all the tickets into one, because `unstake` method receives only one ticket
    const [destinationTicket, ...sourceTickets] = tickets;
    const destinationMemeTicket = new MemeTicketClientV2(destinationTicket.id, clientV2);

    if (sourceTickets.length > 0) {
      const sourceMemeTickets = sourceTickets.map((ticket) => new MemeTicketClientV2(ticket.id, clientV2));

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

    const amount = 1000;
    console.log("[unstake] Unstaking amount: " + amount);

    // Unstake
    await stakingPool.unstake({ amount: new BN(amount), user: payer, ticket: destinationMemeTicket });
  } catch (e) {
    console.error("[unstake] Error:", e);
  }
};

unstake();
