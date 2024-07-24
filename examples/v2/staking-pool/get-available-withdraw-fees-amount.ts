import { PublicKey } from "@solana/web3.js";
import { StakingPool as CodegenStakingPool } from "../../../src/schema/v2/codegen/accounts/StakingPool";
import { BoundPoolClientV2, MEMECHAN_PROGRAM_ID_V2_PK, MemeTicketClientV2, StakingPoolClientV2 } from "../../../src";
import { clientV2, connection, payer } from "../../common";

// // yarn tsx examples/v2/staking-pool/get-available-withdraw-fees-amount.ts > withdraw-fees-amount.txt 2>&1
export const getAvailableWithdrawFeesAmount = async () => {
  const memeMint = new PublicKey("ts2d3TH43VVmiren8kCDPdpYUegFyKTv22Pz4wKBSvw");
  const stakingPoolAddress = BoundPoolClientV2.findStakingPda(memeMint, clientV2.memechanProgram.programId);

  console.log("MEMECHAN_PROGRAM_ID_V2_PK: " + MEMECHAN_PROGRAM_ID_V2_PK.toBase58());
  console.log("stakingPoolAddress:", stakingPoolAddress.toBase58());
  const stakingPool = await StakingPoolClientV2.fromStakingPoolId({
    client: clientV2,
    poolAccountAddressId: stakingPoolAddress,
  });

  const fetchedStakingPool = await CodegenStakingPool.fetch(connection, stakingPoolAddress);
  console.log("fetchedStakingPool:", fetchedStakingPool?.toJSON());

  const { tickets } = await MemeTicketClientV2.fetchTicketsByUser2(stakingPool.pool, clientV2, payer.publicKey);
  const ticketFields = tickets.map((ticket) => ticket.fields);

  // Get available withdraw fees amount
  const res = await stakingPool.getAvailableWithdrawFeesAmount({ tickets: ticketFields });
  console.log("res:", res);
};

getAvailableWithdrawFeesAmount();
