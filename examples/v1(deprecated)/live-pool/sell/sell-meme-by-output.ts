import { LivePoolClient } from "../../../../src/live-pool/LivePoolClient";
import { buildAndSendTx, getWalletTokenAccount } from "../../../../src/util";
import { connection, payer } from "../../../common";

// yarn tsx examples/live-pool/sell/sell-meme-by-output.ts > sell-meme-by-output.txt 2>&1
export const sellMemeByOutput = async () => {
  const poolAddress = "5voSmHaQEKE6KrU7GNKVfS53R5Hq5PCiUYJAeZ8Q4FVS";
  const memeMint = "CMRCZYiirTeJvLZoSJAMeSF8NQNL7fN98we3DE77W575";
  const amountIn = "1000"; // That's a formatted amount

  const { minAmountOut, poolKeys, wrappedAmountIn } = await LivePoolClient.getSellMemeOutput({
    poolAddress,
    memeCoinMint: memeMint,
    amountIn,
    connection,
    slippagePercentage: 0.1,
  });
  console.log("\nmemeAmountIn:", wrappedAmountIn.toExact());
  console.log("minAmountOut:", minAmountOut.toExact());

  const walletTokenAccounts = await getWalletTokenAccount(connection, payer.publicKey);

  const sellTransactions = await LivePoolClient.getSellMemeTransactionsByOutput({
    minAmountOut,
    connection,
    payer: payer.publicKey,
    poolKeys,
    wrappedAmountIn,
    walletTokenAccounts,
  });
  console.log("\nsellTransactions:", sellTransactions);

  const signatures = await buildAndSendTx(connection, payer, sellTransactions, {
    skipPreflight: true,
    preflightCommitment: "confirmed",
  });
  console.log("\nsell meme signatures:", signatures);
};

sellMemeByOutput();
