import { PublicKey, sendAndConfirmTransaction } from "@solana/web3.js";
import { LivePoolClientV2 } from "../../../../src";
import { clientV2, connection, payer } from "../../../common";

// yarn tsx examples/v2/live-pool/sell/sell-meme-by-output.ts > sell-meme-by-output.txt 2>&1
export const sellMemeByOutput = async () => {
  const poolAddress = "69fywDppk1B9tXtGQJDiRKDcV8My6NLuyHgAmSToT6bZ";
  const memeMint = "8NmKFkMehRoF9BLSajM9xioitxKWSfXTxw2qrtPtyE2z";
  const amountIn = "10000"; // That's a formatted amount
  const poolClient = await LivePoolClientV2.fromAmmId(new PublicKey(poolAddress), clientV2);

  const { minAmountOut, wrappedAmountIn } = await poolClient.getSellMemeOutput({
    poolAddress,
    memeCoinMint: memeMint,
    amountIn,
    connection,
    slippagePercentage: 20,
  });
  console.log("\nmemeAmountIn:", wrappedAmountIn.toString());
  console.log("minAmountOut:", minAmountOut.toString());

  const sellTransactions = await poolClient.getSellMemeTransactionsByOutput({
    minAmountOut,
    payer: payer.publicKey,
    wrappedAmountIn,
    inTokenMint: poolClient.ammPool.memeMint,
  });
  console.log("\nsellTransactions:", sellTransactions);

  const sig = await sendAndConfirmTransaction(clientV2.connection, sellTransactions, [payer], {
    skipPreflight: true,
    commitment: "confirmed",
  });
  console.log("\nbuy meme signatures:", sig);
};

sellMemeByOutput();
