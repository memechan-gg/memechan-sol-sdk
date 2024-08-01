import { LivePoolClient } from "../../../../src/live-pool/LivePoolClient";
import { connection } from "../../../common";

// yarn tsx examples/live-pool/buy/get-buy-meme-output.ts > buy-meme-output.txt 2>&1
export const getBuyMemeOutput = async () => {
  const poolAddress = "5voSmHaQEKE6KrU7GNKVfS53R5Hq5PCiUYJAeZ8Q4FVS";
  const memeMint = "CMRCZYiirTeJvLZoSJAMeSF8NQNL7fN98we3DE77W575";
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
