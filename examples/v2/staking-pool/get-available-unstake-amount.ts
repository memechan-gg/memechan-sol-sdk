import { PublicKey } from "@solana/web3.js";
import { StakingPool as CodegenStakingPool } from "../../../src/schema/v2/codegen/accounts/StakingPool";
import { connection, payer, clientV2 } from "../../common";
import { BoundPoolClientV2, MemeTicketClientV2, StakingPoolClientV2 } from "../../../src";

// yarn tsx examples/v2/staking-pool/get-available-unstake-amount.ts > available-unstake-amount.txt 2>&1
export const getAvailableUnstakeAmount = async () => {
  const memeMint = new PublicKey("8NmKFkMehRoF9BLSajM9xioitxKWSfXTxw2qrtPtyE2z");
  const stakingPoolAddress = BoundPoolClientV2.findStakingPda(memeMint, clientV2.memechanProgram.programId);

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
    fetchedStakingPool.pool,
    clientV2,
    payer.publicKey,
  );
  console.log("tickets:", tickets);

  // Get available unstake amount
  const amount = await stakingPool.getAvailableUnstakeAmount({
    tickets: tickets.map((ticket) => ticket.fields),
    stakingPoolVestingConfig: fetchedStakingPool.vestingConfig,
  });
  console.log("amount:", amount);
};

getAvailableUnstakeAmount();
