import { PublicKey } from "@solana/web3.js";
import { StakingPool } from "../../src/staking-pool/StakingPool";
import { StakingPool as CodegenStakingPool } from "../../src/schema/codegen/accounts";
import { client, connection, payer } from "../common";
import { MemeTicket } from "../../src/memeticket/MemeTicket";

// yarn tsx examples/staking-pool/get-available-withdraw-fees-amount.ts > withdraw-fees-amount.txt 2>&1
export const getAvailableWithdrawFeesAmount = async () => {
  const stakingPoolAddress = new PublicKey("EeckpiLcg6FZLkjSR31wf9Z8VZUhyWncB5x4Hks5A8ve");
  const stakingPool = await StakingPool.fromStakingPoolId({ client, poolAccountAddressId: stakingPoolAddress });
  const fetchedStakingPool = await CodegenStakingPool.fetch(connection, stakingPoolAddress);
  console.log("fetchedStakingPool:", fetchedStakingPool?.toJSON());

  const memeTicketId = new PublicKey("EhVvd5LfLPV6fXibPe6fVzDtjFd5GEy2XMdioNgAFik2");
  const memeTicket = new MemeTicket(memeTicketId, client);
  const res = await stakingPool.getAvailableWithdrawFeesAmount({ ticket: memeTicket, user: payer });

  console.log("res:", res);
};

getAvailableWithdrawFeesAmount();
