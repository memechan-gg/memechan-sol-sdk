import { LivePoolClient } from "../../../src/live-pool/LivePoolClient";
import { connection } from "../../common";

// yarn tsx examples/live-pool/buy/get-buy-meme-output.ts > buy-meme-output.txt 2>&1
export const getBuyMemeOutput = async () => {
  const poolAddress = "2rzXgHKH7NU9vGKfyBwtuEMtm1JvAJpg7xgYT53hHth7";
  const memeMint = "5vj496NTttpUESayDt2Mpn5jRQBqvLkMwwvJTBPVR4w1";
  const amountIn = "100"; // That's a formatted amount

  const { minAmountOut, wrappedAmountIn } = await LivePoolClient.getBuyMemeOutput({
    poolAddress,
    memeCoinMint: memeMint,
    amountIn,
    connection,
    slippagePercentage: 0.1,
  });

  console.log("\nquoteAmountIn:", wrappedAmountIn.toExact());
  console.log("minAmountOut:", minAmountOut.toExact());
};

getBuyMemeOutput();
