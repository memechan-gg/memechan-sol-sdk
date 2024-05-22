import {
  ApiPoolInfoV4,
  CurrencyAmount,
  Liquidity,
  Percent,
  Token,
  TokenAccount,
  TokenAmount,
  jsonInfo2PoolKeys,
} from "@raydium-io/raydium-sdk";
import { TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { Connection, PublicKey } from "@solana/web3.js";
import BigNumber from "bignumber.js";
import { MEMECHAN_MEME_TOKEN_DECIMALS, MEMECHAN_QUOTE_TOKEN } from "../config/config";
import { makeTxVersion } from "../raydium/config";
import { formatAmmKeysById } from "../raydium/formatAmmKeysById";
import { getNumeratorAndDenominator } from "./utils";

export class LivePool {
  public static async getBuyMemeOutput({
    poolAddress,
    memeCoinMint,
    amountIn,
    slippagePercentage,
    connection,
  }: {
    poolAddress: string;
    memeCoinMint: string;
    amountIn: string;
    slippagePercentage: number;
    connection: Connection;
  }): Promise<{
    minAmountOut: CurrencyAmount | TokenAmount;
    poolKeys: ReturnType<typeof jsonInfo2PoolKeys<ApiPoolInfoV4>>;
    quoteAmountIn: TokenAmount;
  }> {
    const quoteAmountIn = new TokenAmount(MEMECHAN_QUOTE_TOKEN, amountIn, false);
    const tokenOut = new Token(TOKEN_PROGRAM_ID, memeCoinMint, MEMECHAN_MEME_TOKEN_DECIMALS);
    const { numerator, denominator } = getNumeratorAndDenominator(slippagePercentage);
    const slippage = new Percent(numerator, denominator);

    const targetPoolInfo = await formatAmmKeysById(poolAddress, connection);

    if (!targetPoolInfo) {
      throw new Error(`[LivePool.getBuyMemeTransaction] Cannot find data for pool ${poolAddress}`);
    }

    const poolKeys = jsonInfo2PoolKeys(targetPoolInfo);
    const poolInfo = await Liquidity.fetchInfo({ connection, poolKeys });

    const { minAmountOut } = Liquidity.computeAmountOut({
      poolKeys: poolKeys,
      poolInfo: poolInfo,
      amountIn: quoteAmountIn,
      currencyOut: tokenOut,
      slippage,
    });

    return { minAmountOut, poolKeys, quoteAmountIn };
  }

  public static async getBuyMemeTransactionsByOutput({
    quoteAmountIn,
    connection,
    walletTokenAccounts,
    payer,
    minAmountOut,
    poolKeys,
  }: {
    quoteAmountIn: TokenAmount;
    minAmountOut: CurrencyAmount | TokenAmount;
    connection: Connection;
    walletTokenAccounts: TokenAccount[];
    payer: PublicKey;
    poolKeys: ReturnType<typeof jsonInfo2PoolKeys<ApiPoolInfoV4>>;
  }) {
    const { innerTransactions } = await Liquidity.makeSwapInstructionSimple({
      connection,
      amountIn: quoteAmountIn,
      poolKeys,
      userKeys: {
        tokenAccounts: walletTokenAccounts,
        owner: payer,
      },
      fixedSide: "in",
      amountOut: minAmountOut,
      makeTxVersion,
    });

    return innerTransactions;
  }

  public static async getBuyMemeTransactions({
    poolAddress,
    memeCoinMint,
    amountIn,
    payer,
    slippagePercentage,
    connection,
    walletTokenAccounts,
  }: {
    poolAddress: string;
    memeCoinMint: string;
    amountIn: string;
    payer: PublicKey;
    slippagePercentage: number;
    connection: Connection;
    walletTokenAccounts: TokenAccount[];
  }) {
    const { minAmountOut, poolKeys, quoteAmountIn } = await LivePool.getBuyMemeOutput({
      poolAddress,
      memeCoinMint,
      amountIn,
      connection,
      slippagePercentage,
    });

    const innerTransactions = await LivePool.getBuyMemeTransactionsByOutput({
      connection,
      minAmountOut,
      payer,
      poolKeys,
      quoteAmountIn,
      walletTokenAccounts,
    });

    return innerTransactions;
  }

  public static async getMemePrice({
    poolAddress,
    quotePriceInUsd,
    connection,
  }: {
    poolAddress: string;
    quotePriceInUsd: number;
    connection: Connection;
  }) {
    const targetPoolInfo = await formatAmmKeysById(poolAddress, connection);
    const poolKeys = jsonInfo2PoolKeys(targetPoolInfo);

    const quoteAmountIn = new TokenAmount(MEMECHAN_QUOTE_TOKEN, 10);
    const tokenOut = new Token(TOKEN_PROGRAM_ID, poolKeys.baseMint, MEMECHAN_MEME_TOKEN_DECIMALS);
    const slippage = new Percent(1, 10000);

    const { amountOut } = Liquidity.computeAmountOut({
      poolKeys: poolKeys,
      poolInfo: await Liquidity.fetchInfo({ connection, poolKeys }),
      amountIn: quoteAmountIn,
      currencyOut: tokenOut,
      slippage: slippage,
    });

    const memePriceInQuote = new BigNumber(10).div(amountOut.toExact()).toString();
    const memePriceInUsd = new BigNumber(memePriceInQuote).multipliedBy(quotePriceInUsd).toString();

    return { priceInQuote: memePriceInQuote, priceInUsd: memePriceInUsd };
  }
}
