import { PublicKey } from "@solana/web3.js";
import { StakingPool as CodegenStakingPool } from "../../../src/schema/v2/codegen/accounts/StakingPool";
import { clientV2 as client, connection } from "../../common";
import { MemeTicketClientV2, StakingPoolClientV2 } from "../../../src";
import { BN } from "bn.js";

// yarn tsx examples/staking-pool/get-available-unstake-amount-v2.ts > available-unstake-amount.txt 2>&1
export const getAvailableUnstakeAmount = async () => {
  const stakingPoolAddress = new PublicKey("DsnzFrTebjHfP2LxvVf4TktsoV1ACJRiai1Du4KyAdvS");
  const user = new PublicKey("BFHEpqYNfRkHTBnqmFcfru46Fpr48s48kScZ7dXXcHzW");

  // Get staking pool
  const stakingPool = await StakingPoolClientV2.fromStakingPoolId({
    client,
    poolAccountAddressId: stakingPoolAddress,
  });
  const fetchedStakingPool = await CodegenStakingPool.fetch(connection, stakingPoolAddress);
  console.log("fetchedStakingPool:", fetchedStakingPool?.toJSON());

  if (fetchedStakingPool === null) {
    throw new Error("[getAvailableUnstakeAmount] No staking pool found.");
  }

  const boundPoolAddress = stakingPool.pool;

  // Get all user tickets
  const { tickets } = await MemeTicketClientV2.fetchAvailableTicketsByUser2(boundPoolAddress, client, user);
  console.log("tickets:", tickets);

  let notional = new BN(0);
  let released = new BN(0);
  for (let i = 0; i < tickets.length; i++) {
    const ticket = tickets[i];
    notional = notional.add(ticket.fields.vesting.notional);
    released = released.add(ticket.fields.vesting.released);
  }
  console.log(
    `notional total: ${notional.toString()} released total: ${released.toString()} diff: ${notional.sub(released).toString()}`,
  );

  // Get available unstake amount
  const amount = await stakingPool.getAvailableUnstakeAmount({
    tickets: tickets.map((ticket) => ticket.fields),
    stakingPoolVestingConfig: fetchedStakingPool.vestingConfig,
  });
  console.log("amount:", amount);
};

getAvailableUnstakeAmount();
