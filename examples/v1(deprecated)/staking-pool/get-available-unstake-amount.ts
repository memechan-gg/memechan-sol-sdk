import { PublicKey } from "@solana/web3.js";
import { StakingPool as CodegenStakingPool } from "../../../src/schema/codegen/accounts";
import { client, connection, payer } from "../../common";
import { MemeTicketClient, StakingPoolClient } from "../../../src";

// yarn tsx examples/staking-pool/get-available-unstake-amount.ts > available-unstake-amount.txt 2>&1
export const getAvailableUnstakeAmount = async () => {
  const boundPoolAddress = new PublicKey("2paxDkj5zFR3DtMVZtmTSbkMYZwFtVZnq2Xv1WFHqgPo");
  const stakingPoolAddress = new PublicKey("sh5hozk6bENHvG4J5zrqW2S5eKjp68DRPZodCRLSkJU");

  // Get staking pool
  const stakingPool = await StakingPoolClient.fromStakingPoolId({ client, poolAccountAddressId: stakingPoolAddress });
  const fetchedStakingPool = await CodegenStakingPool.fetch(connection, stakingPoolAddress);
  console.log("fetchedStakingPool:", fetchedStakingPool?.toJSON());

  if (fetchedStakingPool === null) {
    throw new Error("[getAvailableUnstakeAmount] No staking pool found.");
  }

  // Get all user tickets
  const { tickets } = await MemeTicketClient.fetchAvailableTicketsByUser2(boundPoolAddress, client, payer.publicKey);
  console.log("tickets:", tickets);

  // Get available unstake amount
  const amount = await stakingPool.getAvailableUnstakeAmount({
    tickets: tickets.map((ticket) => ticket.fields),
    stakingPoolVestingConfig: fetchedStakingPool.vestingConfig,
  });
  console.log("amount:", amount);
};

getAvailableUnstakeAmount();
