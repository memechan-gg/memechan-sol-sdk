import { LivePool } from "../../../src/live-pool/LivePool";
import { buildAndSendTx, getWalletTokenAccount } from "../../../src/util";
import { connection, payer } from "../../common";

// yarn tsx examples/live-pool/sell/sell-meme-by-output.ts > sell-meme-by-output.txt 2>&1
export const sellMemeByOutput = async () => {
  const poolAddress = "2rzXgHKH7NU9vGKfyBwtuEMtm1JvAJpg7xgYT53hHth7";
  const memeMint = "5vj496NTttpUESayDt2Mpn5jRQBqvLkMwwvJTBPVR4w1";
  const amountIn = "1000"; // That's a formatted amount

  const { minAmountOut, poolKeys, wrappedAmountIn } = await LivePool.getSellMemeOutput({
    poolAddress,
    memeCoinMint: memeMint,
    amountIn,
    connection,
    slippagePercentage: 0.1,
  });
  console.log("\nmemeAmountIn:", wrappedAmountIn.toExact());
  console.log("minAmountOut:", minAmountOut.toExact());

  const walletTokenAccounts = await getWalletTokenAccount(connection, payer.publicKey);

  const sellTransactions = await LivePool.getSellMemeTransactionsByOutput({
    minAmountOut,
    connection,
    payer: payer.publicKey,
    poolKeys,
    wrappedAmountIn,
    walletTokenAccounts,
  });
  console.log("\nsellTransactions:", sellTransactions);

  const signatures = await buildAndSendTx(connection, payer, sellTransactions, { skipPreflight: true });
  console.log("\nsell meme signatures:", signatures);
};

sellMemeByOutput();
