import { Percent, Token, TokenAmount } from "@raydium-io/raydium-sdk";
import { TOKEN_PROGRAM_ID } from "@memechan/spl-token";
import { MEMECHAN_MEME_TOKEN_DECIMALS, TOKEN_INFOS } from "../../src/config/config";
import { swapOnlyAmm } from "../../src/raydium/swapOnlyAmm";
import { client, connection, payer } from "../common";
import { getWalletTokenAccount } from "../../src/util";
import { LivePoolClient } from "../../src";

// yarn tsx examples/raydium/swap.ts > swap.txt 2>&1
export const swap = async () => {
  const poolAddress = "BevUTtVUZQ4LdwWfcq4Uom88yuj1WE2EUiZBgESUsFQT";
  const memeMint = "2Y3jTuAc778X9Fgh9iejxpK6zBYDSwpUdr1Kz5SdGh5x";

  const quoteAmountIn = new TokenAmount(TOKEN_INFOS.SLERF, 10000000);
  const tokenOut = new Token(TOKEN_PROGRAM_ID, memeMint, MEMECHAN_MEME_TOKEN_DECIMALS);
  const slippage = new Percent(1, 10000);
  const walletTokenAccounts = await getWalletTokenAccount(client.connection, payer.publicKey);

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

  const txIds = await swapOnlyAmm({
    connection,
    inputTokenAmount: quoteAmountIn,
    outputToken: tokenOut,
    slippage,
    targetPool: poolAddress,
    wallet: payer,
    walletTokenAccounts,
  });
  console.log("txIds:", txIds);
};

swap();
