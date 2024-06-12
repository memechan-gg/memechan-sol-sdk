import fs from "fs";
import { VestingClient } from "../../src";
import { connection, payer } from "../common";
import { PublicKey } from "@solana/web3.js";

// TODO: Add path to file with data
const usersVestingDataJsonPath = "path_to_file";
// TODO: Add typeguard for this data
const usersVestingData = JSON.parse(fs.readFileSync(usersVestingDataJsonPath, "utf-8"));

const createVesting = async () => {
  const batchedTransactions = await VestingClient.getBatchedCreateVestingTransactions({
    payer: payer.publicKey,
    // TODO: Replace mint with real one
    mint: new PublicKey(""),
    vestingsData: usersVestingData,
  });

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
