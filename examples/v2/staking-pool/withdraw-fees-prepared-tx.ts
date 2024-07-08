import { PublicKey, sendAndConfirmTransaction } from "@solana/web3.js";
import { StakingPool as CodegenStakingPool } from "../../../src/schema/v2/codegen/accounts/StakingPool";
import { BoundPoolClientV2, MemeTicketClientV2, StakingPoolClientV2 } from "../../../src";
import { clientV2, connection, payer } from "../../common";

// yarn tsx examples/v2/staking-pool/withdraw-fees-prepared-tx.ts > withdraw-fees-amount-tx.txt 2>&1
export const withdrawFees = async () => {
  // Get staking pool
  const memeMint = new PublicKey("8NmKFkMehRoF9BLSajM9xioitxKWSfXTxw2qrtPtyE2z");
  const stakingPoolAddress = BoundPoolClientV2.findStakingPda(memeMint, clientV2.memechanProgram.programId);

  console.log("Got here");
  const stakingPool = await StakingPoolClientV2.fromStakingPoolId({
    client: clientV2,
    poolAccountAddressId: stakingPoolAddress,
  });
  console.log("Got here too");

  // const ammPoolAddress = new PublicKey("6HGw19h7NRSQ1kkiFGzydjq17N9CijjeqknFhiKXdiPx");

  const fetchedStakingPool = await CodegenStakingPool.fetch(connection, stakingPoolAddress);
  console.log("fetchedStakingPool:", fetchedStakingPool?.toJSON());

  const tickets = await MemeTicketClientV2.fetchAvailableTicketsByUser2(
    fetchedStakingPool!.pool,
    clientV2,
    payer.publicKey,
  );

  console.log("tickets:", tickets);

  // Get meme ticket

  // call addfees to accumulate fees
  // await stakingPool.addFees({payer, transaction: new Transaction(), ammPoolId: ammPoolAddress});

  // getAddFeesTransaction

  // Get available withdraw fees amount
  const transaction = await stakingPool.getPreparedWithdrawFeesTransactions({
    ammPoolId: fetchedStakingPool!.chanAmmPool,
    ticketIds: tickets.tickets.map((t) => t.id),
    user: payer.publicKey,
  });

  for (const tx of transaction) {
    const signature2 = await sendAndConfirmTransaction(connection, tx, [payer], {
      commitment: "confirmed",
      skipPreflight: true,
      preflightCommitment: "confirmed",
    });
    console.log("addfees chanFeesTx signature:", signature2);
  }
};

withdrawFees();
