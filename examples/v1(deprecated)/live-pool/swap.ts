import { Percent, Token, TokenAmount } from "@raydium-io/raydium-sdk";
import { MEMECHAN_MEME_TOKEN_DECIMALS, TOKEN_INFOS } from "../../../src/config/config";
import { swapOnlyAmm } from "../../../src/raydium/swapOnlyAmm";
import { client, connection, payer } from "../../common";
import { getWalletTokenAccount } from "../../../src/util";

// yarn tsx examples/live-pool/swap.ts > swap.txt 2>&1
export const swap = async () => {
  const ammPoolAddress = "BevUTtVUZQ4LdwWfcq4Uom88yuj1WE2EUiZBgESUsFQT";
  const quoteAmountIn = new TokenAmount(TOKEN_INFOS.SLERF, 2000);
  const { TOKEN_PROGRAM_ID } = await import("@solana/spl-token");
  const tokenOut = new Token(
    TOKEN_PROGRAM_ID,
    "2Y3jTuAc778X9Fgh9iejxpK6zBYDSwpUdr1Kz5SdGh5x",
    MEMECHAN_MEME_TOKEN_DECIMALS,
  );
  const slippage = new Percent(1, 100);
  const walletTokenAccounts = await getWalletTokenAccount(client.connection, payer.publicKey);

  const txIds = await swapOnlyAmm({
    connection,
    inputTokenAmount: quoteAmountIn,
    outputToken: tokenOut,
    slippage,
    targetPool: ammPoolAddress,
    wallet: payer,
    walletTokenAccounts,
  });
  console.log("txIds:", txIds);
};

swap();
