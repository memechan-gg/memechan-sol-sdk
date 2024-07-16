import { getConfig, LivePoolClientV2 } from "../../../../src";
import { connection } from "../../../common";
import BigNumber from "bignumber.js";

// yarn tsx examples/v2/live-pool/sell/get-sell-meme-output.ts > buy-meme-output.txt 2>&1
export const getSellMemeOutput = async () => {
  const poolAddress = "69fywDppk1B9tXtGQJDiRKDcV8My6NLuyHgAmSToT6bZ";
  const memeMint = "8NmKFkMehRoF9BLSajM9xioitxKWSfXTxw2qrtPtyE2z";
  const amountIn = "1000000"; // That's a formatted amount, need to multiply by decimals

  const { minAmountOut, wrappedAmountIn } = await LivePoolClientV2.getSellMemeOutput({
    poolAddress,
    memeCoinMint: memeMint,
    amountIn,
    connection,
    slippagePercentage: 20,
  });

  console.log("\nquoteAmountIn:", wrappedAmountIn.toString());
  console.log("minAmountOut:", minAmountOut.toString());

  const { TOKEN_INFOS } = await getConfig();

  const outputAmount2 = new BigNumber(minAmountOut.toString()).div(10 ** TOKEN_INFOS.WSOL.decimals);
  console.log("minAmountOut2 formatted:", outputAmount2.toString());
};

getSellMemeOutput();
