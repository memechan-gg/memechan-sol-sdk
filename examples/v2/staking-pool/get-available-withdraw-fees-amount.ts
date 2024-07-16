import { PublicKey } from "@solana/web3.js";
import { StakingPool as CodegenStakingPool } from "../../../src/schema/v2/codegen/accounts/StakingPool";
import { BoundPoolClientV2, MemeTicketClientV2, StakingPoolClientV2 } from "../../../src";
import { connection, createMemeChanClientV2, payer } from "../../common";

// // yarn tsx examples/v2/staking-pool/get-available-withdraw-fees-amount.ts > withdraw-fees-amount.txt 2>&1
export const getAvailableWithdrawFeesAmount = async () => {
  const memeMint = new PublicKey("8NmKFkMehRoF9BLSajM9xioitxKWSfXTxw2qrtPtyE2z");
  const clientV2 = await createMemeChanClientV2();

  const stakingPoolAddress = BoundPoolClientV2.findStakingPda(memeMint, clientV2.memechanProgram.programId);

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
