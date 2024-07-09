import { ApiPoolInfoV4, Liquidity, Percent, Token, TokenAmount, jsonInfo2PoolKeys } from "@raydium-io/raydium-sdk";
import { AccountInfo, Connection, PublicKey } from "@solana/web3.js";
import BigNumber from "bignumber.js";
import { MEMECHAN_MEME_TOKEN_DECIMALS } from "../config/config";
import { makeTxVersion } from "../raydium/config";
import { formatAmmKeysById } from "../raydium/formatAmmKeysById";
import {
  GetSwapMemeOutputArgs,
  GetSwapMemeTransactionsArgs,
  GetSwapMemeTransactionsByOutputArgs,
  SwapMemeOutput,
} from "./types";
import { getNumeratorAndDenominator } from "./utils";
import { MemechanClient } from "../MemechanClient";
import BN from "bn.js";
import { getMultipleTokenBalances } from "../util/getMultipleTokenBalances";
import { getTokenInfoByMint } from "../config/helpers";
import { TokenInfo } from "../config/types";
import { formatAmmKeysByAccountInfo } from "../raydium/formatAmmKeysByAccountInfo";

export class LivePoolClient {
  private constructor(
    public ammId: PublicKey,
    public ammPoolInfo: ApiPoolInfoV4,
    public client: MemechanClient,
  ) {}

  public getTokenInfo(): TokenInfo {
    return getTokenInfoByMint(new PublicKey(this.ammPoolInfo.quoteMint));
  }

  public static async fromAmmId(ammId: PublicKey, client: MemechanClient): Promise<LivePoolClient> {
    return new LivePoolClient(ammId, await formatAmmKeysById(ammId.toBase58(), client.connection), client);
  }

  public static async fromAccountInfo(
    ammId: PublicKey,
    accountInfo: AccountInfo<Buffer>,
    client: MemechanClient,
  ): Promise<LivePoolClient> {
    return new LivePoolClient(
      ammId,
      await formatAmmKeysByAccountInfo(ammId.toBase58(), accountInfo, client.connection),
      client,
    );
  }

  public static async getBuyMemeOutput({
    poolAddress,
    memeCoinMint,
    amountIn,
    slippagePercentage,
    connection,
  }: GetSwapMemeOutputArgs): Promise<SwapMemeOutput> {
    const { TOKEN_PROGRAM_ID } = await import("@solana/spl-token");
    const tokenOut = new Token(TOKEN_PROGRAM_ID, new PublicKey(memeCoinMint), MEMECHAN_MEME_TOKEN_DECIMALS);
    const { numerator, denominator } = getNumeratorAndDenominator(slippagePercentage);
    const slippage = new Percent(numerator, denominator);

    const targetPoolInfo = await formatAmmKeysById(poolAddress, connection);

    if (!targetPoolInfo) {
      throw new Error(`[LivePoolClient.getBuyMemeOutput] Cannot find data for pool ${poolAddress}`);
    }

    const poolKeys = jsonInfo2PoolKeys(targetPoolInfo);

    const [baseReserve, quoteReserve] = await getReserveBalances(connection, [poolKeys.baseVault, poolKeys.quoteVault]);

    const quoteTokenInfo = getTokenInfoByMint(poolKeys.quoteMint);
    const quoteAmountIn = new TokenAmount(quoteTokenInfo, amountIn, false);

    const { minAmountOut } = Liquidity.computeAmountOut({
      poolKeys: poolKeys,
      poolInfo: {
        status: new BN(0),
        baseDecimals: 0,
        quoteDecimals: 0,
        lpDecimals: 0,
        baseReserve: baseReserve,
        quoteReserve: quoteReserve,
        lpSupply: new BN(0),
        startTime: new BN(0),
      },
      amountIn: quoteAmountIn,
      currencyOut: tokenOut,
      slippage,
    });

    return { minAmountOut, poolKeys, wrappedAmountIn: quoteAmountIn };
  }

  public static async getBuyMemeTransactionsByOutput({
    wrappedAmountIn,
    connection,
    walletTokenAccounts,
    payer,
    minAmountOut,
    poolKeys,
  }: GetSwapMemeTransactionsByOutputArgs) {
    const { innerTransactions } = await Liquidity.makeSwapInstructionSimple({
      connection,
      amountIn: wrappedAmountIn,
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
  }: GetSwapMemeTransactionsArgs) {
    const { minAmountOut, poolKeys, wrappedAmountIn } = await LivePoolClient.getBuyMemeOutput({
      poolAddress,
      memeCoinMint,
      amountIn,
      connection,
      slippagePercentage,
    });

    const innerTransactions = await LivePoolClient.getBuyMemeTransactionsByOutput({
      connection,
      minAmountOut,
      payer,
      poolKeys,
      wrappedAmountIn,
      walletTokenAccounts,
    });

    return innerTransactions;
  }

  public static async getSellMemeOutput({
    poolAddress,
    memeCoinMint,
    amountIn,
    slippagePercentage,
    connection,
  }: GetSwapMemeOutputArgs): Promise<SwapMemeOutput> {
    const { TOKEN_PROGRAM_ID } = await import("@solana/spl-token");
    const memeToken = new Token(TOKEN_PROGRAM_ID, new PublicKey(memeCoinMint), MEMECHAN_MEME_TOKEN_DECIMALS);
    const memeAmountIn = new TokenAmount(memeToken, amountIn, false);
    const { numerator, denominator } = getNumeratorAndDenominator(slippagePercentage);
    const slippage = new Percent(numerator, denominator);

    const targetPoolInfo = await formatAmmKeysById(poolAddress, connection);

    if (!targetPoolInfo) {
      throw new Error(`[LivePoolClient.getSellMemeOutput] Cannot find data for pool ${poolAddress}`);
    }

    const poolKeys = jsonInfo2PoolKeys(targetPoolInfo);

    const [baseReserve, quoteReserve] = await getReserveBalances(connection, [poolKeys.baseVault, poolKeys.quoteVault]);

    const quoteTokenInfo = getTokenInfoByMint(poolKeys.quoteMint);

    const { minAmountOut } = Liquidity.computeAmountOut({
      poolKeys: poolKeys,
      poolInfo: {
        status: new BN(0),
        baseDecimals: 0,
        quoteDecimals: 0,
        lpDecimals: 0,
        baseReserve: baseReserve,
        quoteReserve: quoteReserve,
        lpSupply: new BN(0),
        startTime: new BN(0),
      },
      amountIn: memeAmountIn,
      currencyOut: quoteTokenInfo,
      slippage,
    });

    return { minAmountOut, poolKeys, wrappedAmountIn: memeAmountIn };
  }

  public static async getSellMemeTransactionsByOutput({
    wrappedAmountIn,
    connection,
    walletTokenAccounts,
    payer,
    minAmountOut,
    poolKeys,
  }: GetSwapMemeTransactionsByOutputArgs) {
    const { innerTransactions } = await Liquidity.makeSwapInstructionSimple({
      connection,
      amountIn: wrappedAmountIn,
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

  public static async getSellMemeTransactions({
    poolAddress,
    memeCoinMint,
    amountIn,
    payer,
    slippagePercentage,
    connection,
    walletTokenAccounts,
  }: GetSwapMemeTransactionsArgs) {
    const { minAmountOut, poolKeys, wrappedAmountIn } = await LivePoolClient.getSellMemeOutput({
      poolAddress,
      memeCoinMint,
      amountIn,
      connection,
      slippagePercentage,
    });

    const innerTransactions = await LivePoolClient.getSellMemeTransactionsByOutput({
      connection,
      minAmountOut,
      payer,
      poolKeys,
      wrappedAmountIn,
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

    const quoteTokenInfo = getTokenInfoByMint(poolKeys.quoteMint);
    const quoteAmountIn = new TokenAmount(quoteTokenInfo, 1000, false);
    const { TOKEN_PROGRAM_ID } = await import("@solana/spl-token");
    const tokenOut = new Token(TOKEN_PROGRAM_ID, poolKeys.baseMint, MEMECHAN_MEME_TOKEN_DECIMALS);
    const slippage = new Percent(1, 10000);

    const [baseReserve, quoteReserve] = await getReserveBalances(connection, [poolKeys.baseVault, poolKeys.quoteVault]);

    const { amountOut } = Liquidity.computeAmountOut({
      poolKeys: poolKeys,
      poolInfo: {
        status: new BN(0),
        baseDecimals: 0,
        quoteDecimals: 0,
        lpDecimals: 0,
        baseReserve: baseReserve,
        quoteReserve: quoteReserve,
        lpSupply: new BN(0),
        startTime: new BN(0),
      },
      amountIn: quoteAmountIn,
      currencyOut: tokenOut,
      slippage: slippage,
    });

    const memePriceInQuote = new BigNumber(quoteAmountIn.toExact()).div(amountOut.toExact()).toString();
    const memePriceInUsd = new BigNumber(memePriceInQuote).multipliedBy(quotePriceInUsd).toString();

    return { priceInQuote: memePriceInQuote, priceInUsd: memePriceInUsd };
  }

  public static async getQuoteTokenDisplayName(ammId: PublicKey, client: MemechanClient) {
    const pool = await LivePoolClient.fromAmmId(ammId, client);
    const quoteToken = getTokenInfoByMint(new PublicKey(pool.ammPoolInfo.quoteMint));
    return quoteToken.displayName;
  }

  public async getMemePrice(args: { poolAddress: string; quotePriceInUsd: number; connection: Connection }) {
    return await LivePoolClient.getMemePrice(args);
  }

  public async getBuyMemeOutput(args: GetSwapMemeOutputArgs): Promise<SwapMemeOutput> {
    return await LivePoolClient.getBuyMemeOutput(args);
  }

  public async getSellMemeOutput(args: GetSwapMemeOutputArgs): Promise<SwapMemeOutput> {
    return await LivePoolClient.getSellMemeOutput(args);
  }

  public async getBuyMemeTransactionsByOutput(args: GetSwapMemeTransactionsByOutputArgs) {
    return await LivePoolClient.getBuyMemeTransactionsByOutput(args);
  }

  public async getSellMemeTransactionsByOutput(args: GetSwapMemeTransactionsByOutputArgs) {
    return await LivePoolClient.getSellMemeTransactionsByOutput(args);
  }
}

async function getReserveBalances(connection: Connection, addresses: PublicKey[]): Promise<[BN, BN]> {
  const amounts = await getMultipleTokenBalances(connection, addresses);
  return [new BN(amounts[0].toString()), new BN(amounts[1].toString())];
}
