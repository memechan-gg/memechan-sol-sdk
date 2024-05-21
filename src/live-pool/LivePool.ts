import { Liquidity, Percent, Token, TokenAmount, jsonInfo2PoolKeys } from "@raydium-io/raydium-sdk";
import { TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { Connection } from "@solana/web3.js";
import BigNumber from "bignumber.js";
import { MEMECHAN_MEMECOIN_DECIMALS, MEMECHAN_QUOTE_TOKEN } from "../config/config";
import { formatAmmKeysById } from "../raydium/formatAmmKeysById";

export class LivePool {
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
    const tokenOut = new Token(TOKEN_PROGRAM_ID, poolKeys.baseMint, MEMECHAN_MEMECOIN_DECIMALS);
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
