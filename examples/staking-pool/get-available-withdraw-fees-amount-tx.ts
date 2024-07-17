import { PublicKey } from "@solana/web3.js";
import { StakingPool as CodegenStakingPool } from "../../src/schema/codegen/accounts";
import { client, connection, payer } from "../common";
import { MemeTicketClient, StakingPoolClient } from "../../src";

// yarn tsx examples/staking-pool/get-available-withdraw-fees-amount-tx.ts > withdraw-fees-amount-tx.txt 2>&1
export const getAvailableWithdrawFeesAmount = async () => {
  // Get staking pool
  const stakingPoolAddress = new PublicKey("EWuDJ1xifbipiDRm5mwgoGEwY4qFH6ApFT6PMet98Qfc");
  const stakingPool = await StakingPoolClient.fromStakingPoolId({ client, poolAccountAddressId: stakingPoolAddress });
  // const ammPoolAddress = new PublicKey("6HGw19h7NRSQ1kkiFGzydjq17N9CijjeqknFhiKXdiPx");

  const fetchedStakingPool = await CodegenStakingPool.fetch(connection, stakingPoolAddress);
  console.log("fetchedStakingPool:", fetchedStakingPool?.toJSON());

  // Get meme ticket
  const memeTicketId = new PublicKey("4cCT3HtFWLEmZU9LG9koZc9B4DVjZ6SybG2RjFgxjUSM");
  const memeTicket = new MemeTicketClient(memeTicketId, client);

  // call addfees to accumulate fees
  // await stakingPool.addFees({payer, transaction: new Transaction(), ammPoolId: ammPoolAddress});

  // getAddFeesTransaction

  // Get available withdraw fees amount
  const transaction = await stakingPool.getWithdrawFeesTransaction({ ticket: memeTicket, user: payer.publicKey });

  console.log("simulating transaction...");

  const getWithdrawFeesResult = await client.connection.simulateTransaction(transaction, [payer], true);

  console.log("getWithdrawFeesResult:", getWithdrawFeesResult);

  const feesRegex = /fees_meme: (\d+) fees_quote: (\d+)/;
  getWithdrawFeesResult.value.logs?.forEach((log) => {
    const match = log.match(feesRegex);
    if (match) {
      const feesMeme = parseInt(match[1], 10) / 1e6; // Convert to decimal with 6 places
      const feesQuote = parseInt(match[2], 10) / 1e9; // Convert to decimal with 9 places
      console.log(`fees_meme: ${feesMeme.toFixed(6)}, fees_quote: ${feesQuote.toFixed(9)}`);
    }
  });
};

getAvailableWithdrawFeesAmount();
