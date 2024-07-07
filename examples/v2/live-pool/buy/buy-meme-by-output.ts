import { PublicKey, sendAndConfirmTransaction } from "@solana/web3.js";
import { LivePoolClientV2 } from "../../../../src";
import { clientV2, payer } from "../../../common";

// yarn tsx examples/v2/live-pool/buy/buy-meme-by-output.ts > buy-meme-by-output.txt 2>&1
export const buyMemeByOutput = async () => {
  const amountIn = "0.0001"; // That's a formatted amount

  const poolAddress = "69fywDppk1B9tXtGQJDiRKDcV8My6NLuyHgAmSToT6bZ";
  const memeMint = "8NmKFkMehRoF9BLSajM9xioitxKWSfXTxw2qrtPtyE2z";
  const poolClient = await LivePoolClientV2.fromAmmId(new PublicKey(poolAddress), clientV2);

  const { minAmountOut, wrappedAmountIn } = await poolClient.getBuyMemeOutput({
    poolAddress,
    memeCoinMint: memeMint,
    amountIn,
    connection: clientV2.connection,
    slippagePercentage: 25,
  });
  console.log("\nquoteAmountIn:", wrappedAmountIn.toString());
  console.log("minAmountOut:", minAmountOut.toString());

  //  tODO:FIX:ARGUMENTS
  const buyTransactions = await poolClient.getBuyMemeTransactionsByOutput({
    minAmountOut: minAmountOut,
    inTokenMint: poolClient.ammPool.quoteMint,
    payer: payer.publicKey,
    wrappedAmountIn,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } as any);
  console.log("\nbuyTransactions:", buyTransactions);

  const sig = await sendAndConfirmTransaction(clientV2.connection, buyTransactions, [payer], {
    skipPreflight: true,
    commitment: "confirmed",
  });
  console.log("\nbuy meme signatures:", sig);
};

buyMemeByOutput();
