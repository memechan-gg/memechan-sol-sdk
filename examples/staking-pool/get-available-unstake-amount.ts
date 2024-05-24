import { PublicKey } from "@solana/web3.js";
import { StakingPool as CodegenStakingPool } from "../../src/schema/codegen/accounts";
import { client, connection, payer } from "../common";
import { MemeTicketClient, StakingPoolClient } from "../../src";

// yarn tsx examples/staking-pool/get-available-unstake-amount.ts > available-unstake-amount.txt 2>&1
export const getAvailableUnstakeAmount = async () => {
  const boundPoolAddress = new PublicKey("D3fRV97S8MheYhvm1ofu2N8xsKQuwuHycUFwhMfRDGoi");
  const stakingPoolAddress = new PublicKey("FMyKyPPmgRHdCVsfvdyuR6Y4BAgNvsQCPQtMAtEcysmm");

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

  // Get available unstake amount
  const amount = await stakingPool.getAvailableUnstakeAmount({
    tickets: tickets.map((ticket) => ticket.fields),
    stakingPoolVestingConfig: fetchedStakingPool.vestingConfig,
  });
  console.log("amount:", amount);
};

getAvailableUnstakeAmount();
