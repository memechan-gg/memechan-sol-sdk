import { Percent, Token, TokenAmount } from "@raydium-io/raydium-sdk";
import { TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { MEMECHAN_MEME_TOKEN_DECIMALS, MEMECHAN_QUOTE_TOKEN } from "../../src/config/config";
import { swapOnlyAmm } from "../../src/raydium/swapOnlyAmm";
import { client, connection, payer } from "../common";
import { getWalletTokenAccount } from "../../src/util";

// yarn tsx examples/live-pool/swap.ts > swap.txt 2>&1
export const swap = async () => {
  const poolAddress = "3KgPp4q7DpeNSjA7aQSxtEKpDSGHDgf5SQasYUwd7A23";
  const quoteAmountIn = new TokenAmount(MEMECHAN_QUOTE_TOKEN, 20000000);
  const tokenOut = new Token(
    TOKEN_PROGRAM_ID,
    "Ag1wTJEa9MyZcdZoNQfYBLobgCjdu9GNeHftZ8X2MLP2",
    MEMECHAN_MEME_TOKEN_DECIMALS,
  );
  const slippage = new Percent(1, 10000);
  const walletTokenAccounts = await getWalletTokenAccount(client.connection, payer.publicKey);

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
