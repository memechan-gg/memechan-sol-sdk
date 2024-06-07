import { PublicKey } from "@solana/web3.js";
import { StakingPool as CodegenStakingPool } from "../../src/schema/codegen/accounts";
import { client, connection, payer } from "../common";
import { MemeTicketClient, StakingPoolClient } from "../../src";

// yarn tsx examples/staking-pool/get-available-withdraw-fees-amount.ts > withdraw-fees-amount.txt 2>&1
export const getAvailableWithdrawFeesAmount = async () => {
  const boundPoolAddress = new PublicKey("2paxDkj5zFR3DtMVZtmTSbkMYZwFtVZnq2Xv1WFHqgPo");
  const stakingPoolAddress = new PublicKey("sh5hozk6bENHvG4J5zrqW2S5eKjp68DRPZodCRLSkJU");
  const stakingPool = await StakingPoolClient.fromStakingPoolId({ client, poolAccountAddressId: stakingPoolAddress });

  const fetchedStakingPool = await CodegenStakingPool.fetch(connection, stakingPoolAddress);
  console.log("fetchedStakingPool:", fetchedStakingPool?.toJSON());

  const ammPoolAddress = stakingPool.raydiumAmm;
  // call addfees to accumulate fees
  await stakingPool.addFees({ payer, ammPoolId: ammPoolAddress });

  const tickets = await MemeTicketClient.fetchTicketsByUser2(boundPoolAddress, client, payer.publicKey);
  const ticketFields = tickets.map((ticket) => ticket.fields);

  // Get available withdraw fees amount
  const res = await stakingPool.getAvailableWithdrawFeesAmount({ tickets: ticketFields });
  console.log("res:", res);
};

getAvailableWithdrawFeesAmount();
