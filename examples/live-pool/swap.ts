import { Percent, Token, TokenAmount } from "@raydium-io/raydium-sdk";
import { swapOnlyAmm } from "../../src/raydium/swapOnlyAmm";
import { connection, createMemeChanClient, payer } from "../common";
import { getWalletTokenAccount } from "../../src/util";
import { getConfig } from "../../src";
import { MEMECHAN_MEME_TOKEN_DECIMALS } from "../../src/config/consts";

// yarn tsx examples/live-pool/swap.ts > swap.txt 2>&1
export const swap = async () => {
  const { TOKEN_INFOS } = await getConfig();
  const ammPoolAddress = "BevUTtVUZQ4LdwWfcq4Uom88yuj1WE2EUiZBgESUsFQT";
  const quoteAmountIn = new TokenAmount(TOKEN_INFOS.SLERF, 2000);
  const { TOKEN_PROGRAM_ID } = await import("@solana/spl-token");
  const tokenOut = new Token(
    TOKEN_PROGRAM_ID,
    "2Y3jTuAc778X9Fgh9iejxpK6zBYDSwpUdr1Kz5SdGh5x",
    MEMECHAN_MEME_TOKEN_DECIMALS,
  );
  const slippage = new Percent(1, 100);
  const client = await createMemeChanClient();

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
