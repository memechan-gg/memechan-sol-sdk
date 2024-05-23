import { PublicKey } from "@solana/web3.js";
import { MemeTicket } from "../../src/memeticket/MemeTicket";
import { StakingPool as CodegenStakingPool } from "../../src/schema/codegen/accounts";
import { StakingPool } from "../../src/staking-pool/StakingPool";
import { client, connection, payer } from "../common";

// yarn tsx examples/staking-pool/get-available-unstake-amount.ts > available-unstake-amount.txt 2>&1
export const getAvailableUnstakeAmount = async () => {
  const boundPoolAddress = new PublicKey("B36EwUzBiZqLeKTwJrwPNbwfJaPRwfKcbCyHPLix3xF9");
  const stakingPoolAddress = new PublicKey("EeckpiLcg6FZLkjSR31wf9Z8VZUhyWncB5x4Hks5A8ve");

  const stakingPool = await StakingPool.fromStakingPoolId({ client, poolAccountAddressId: stakingPoolAddress });
  const fetchedStakingPool = await CodegenStakingPool.fetch(connection, stakingPoolAddress);
  console.log("fetchedStakingPool:", fetchedStakingPool?.toJSON());

  if (fetchedStakingPool === null) {
    throw new Error("[getAvailableUnstakeAmount] No staking pool found.");
  }

  const { tickets } = await MemeTicket.fetchAvailableTicketsByUser(boundPoolAddress, client, payer.publicKey);
  console.log("tickets:", tickets);

  const amount = await stakingPool.getAvailableUnstakeAmount({
    tickets: tickets.map((ticket) => ticket.fields),
    stakingPoolVestingConfig: fetchedStakingPool.vestingConfig,
  });
  console.log("amount:", amount);
};

getAvailableUnstakeAmount();
