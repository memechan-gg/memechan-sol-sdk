import { CHAN_TOKEN, UserVestingData, VestingClient } from "../../src";
import { connection, payer } from "../common";
import { readDataFromJsonFile } from "../utils";

// yarn tsx examples/vesting/create-vestings.ts > create-vestings.txt 2>&1
const createVesting = async () => {
  const usersVestingData = (await readDataFromJsonFile("users-vesting-data")) as UserVestingData[];

  const batchedTransactions = await VestingClient.getBatchedCreateVestingTransactions({
    payer: payer.publicKey,
    mint: CHAN_TOKEN,
    vestingsData: usersVestingData,
  });
  console.log("count of transactions:", batchedTransactions.length);

  const failedIndexes: number[] = [];

  for (let i = 0; i < batchedTransactions.length; i++) {
    const tx = batchedTransactions[i];

    const signature = await connection.sendTransaction(tx, [payer], { maxRetries: 3, skipPreflight: true });
    console.log(`[createVesting] Transaction ${i} is sent, signature: ${signature}`);

    const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash("confirmed");
    const txResult = await connection.confirmTransaction(
      {
        signature: signature,
        blockhash: blockhash,
        lastValidBlockHeight: lastValidBlockHeight,
      },
      "confirmed",
    );

    if (txResult.value.err) {
      failedIndexes.push(i);
      console.log(`[createVesting] Transaction ${i} is failed.`);
    } else {
      console.log(`[createVesting] Transaction ${i} is succeeded.`);
    }
  }

  console.log("\nFailed indexes (console.dir):");
  console.dir(failedIndexes, { depth: null });

  console.log("\nFailed indexes (JSON.stringify):");
  console.log(JSON.stringify(failedIndexes));
};

createVesting();
