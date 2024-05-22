import { LivePool } from "../../../src/live-pool/LivePool";
import { buildAndSendTx, getWalletTokenAccount } from "../../../src/util";
import { connection, payer } from "../../common";

// yarn tsx examples/live-pool/buy/buy-meme-by-output.ts > buy-meme-by-output.txt 2>&1
export const buyMemeByOutput = async () => {
  const poolAddress = "2rzXgHKH7NU9vGKfyBwtuEMtm1JvAJpg7xgYT53hHth7";
  const memeMint = "5vj496NTttpUESayDt2Mpn5jRQBqvLkMwwvJTBPVR4w1";
  const amountIn = "1"; // That's a formatted amount

  const { minAmountOut, poolKeys, quoteAmountIn } = await LivePool.getBuyMemeOutput({
    poolAddress,
    memeCoinMint: memeMint,
    amountIn,
    connection,
    slippagePercentage: 0.1,
  });
  console.log("\nquoteAmountIn:", quoteAmountIn.toExact());
  console.log("minAmountOut:", minAmountOut.toExact());

  const walletTokenAccounts = await getWalletTokenAccount(connection, payer.publicKey);

  const buyTransactions = await LivePool.getBuyMemeTransactionsByOutput({
    minAmountOut,
    connection,
    payer: payer.publicKey,
    poolKeys,
    quoteAmountIn,
    walletTokenAccounts,
  });
  console.log("\nbuyTransactions:", buyTransactions);

  const signatures = await buildAndSendTx(connection, payer, buyTransactions, { skipPreflight: true });
  console.log("\nbuy meme signatures:", signatures);
};

buyMemeByOutput();
