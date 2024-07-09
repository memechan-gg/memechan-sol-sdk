import BN from "bn.js";
import { LivePoolClientV2, MEMECHAN_MEME_TOKEN_DECIMALS } from "../../../../src";
import { connection } from "../../../common";

// yarn tsx examples/v2/live-pool/buy/get-buy-meme-output.ts > buy-meme-output.txt 2>&1
export const getBuyMemeOutput = async () => {
  const poolAddress = "69fywDppk1B9tXtGQJDiRKDcV8My6NLuyHgAmSToT6bZ";
  const memeMint = "8NmKFkMehRoF9BLSajM9xioitxKWSfXTxw2qrtPtyE2z";
  const amountIn = "0.0001"; // That's a formatted amount, need to multiply by decimals

  const { minAmountOut, wrappedAmountIn } = await LivePoolClientV2.getBuyMemeOutput({
    poolAddress,
    memeCoinMint: memeMint,
    amountIn,
    connection,
    slippagePercentage: 11,
  });

  console.log("\nquoteAmountIn:", wrappedAmountIn.toString());
  console.log("minAmountOut:", minAmountOut.toString());
  const mintAmountWithDecimals = minAmountOut.divmod(new BN(10 ** MEMECHAN_MEME_TOKEN_DECIMALS));
  console.log(
    "minAmountOut formatted:",
    mintAmountWithDecimals.div.toString() + "." + mintAmountWithDecimals.mod.toString(),
  );
};

getBuyMemeOutput();
