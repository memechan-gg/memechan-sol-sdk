import { PublicKey, Transaction } from "@solana/web3.js";
import { StakingPool as CodegenStakingPool } from "../../src/schema/codegen/accounts";
import { client, connection, payer } from "../common";
import { MemeTicketClient, StakingPoolClient } from "../../src";

// yarn tsx examples/staking-pool/get-available-withdraw-fees-amount.ts > withdraw-fees-amount.txt 2>&1
export const getAvailableWithdrawFeesAmount = async () => {
  // Get staking pool
  const stakingPoolAddress = new PublicKey("FMyKyPPmgRHdCVsfvdyuR6Y4BAgNvsQCPQtMAtEcysmm");
  const stakingPool = await StakingPoolClient.fromStakingPoolId({ client, poolAccountAddressId: stakingPoolAddress });
  const ammPoolAddress = new PublicKey("3KgPp4q7DpeNSjA7aQSxtEKpDSGHDgf5SQasYUwd7A23");

  const fetchedStakingPool = await CodegenStakingPool.fetch(connection, stakingPoolAddress);
  console.log("fetchedStakingPool:", fetchedStakingPool?.toJSON());

  // Get meme ticket
  const memeTicketId = new PublicKey("2bEUpzNfkoeH6kFdDMxz2Q4MvVctFk8umumWunWHgPQt");
  const memeTicket = new MemeTicketClient(memeTicketId, client);

  // call addfees to accumulate fees
  //await stakingPool.addFees({payer, transaction: new Transaction(), ammPoolId: ammPoolAddress});

  // Get available withdraw fees amount
  const res = await stakingPool.getAvailableWithdrawFeesAmount({ ticket: memeTicket, user: payer });
  console.log("res:", res);
};

getAvailableWithdrawFeesAmount();
