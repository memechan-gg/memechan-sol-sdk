import { PublicKey, Connection, ComputeBudgetProgram, Transaction, AccountInfo } from "@solana/web3.js";
import BigNumber from "bignumber.js";
import { COMPUTE_UNIT_PRICE, TOKEN_INFOS, MEMECHAN_MEME_TOKEN_DECIMALS } from "../config/config";
import {
  GetSwapMemeOutputArgs,
  GetSwapMemeTransactionsArgs,
  GetSwapMemeTransactionsArgsV2,
  GetSwapMemeTransactionsByOutputArgsV2,
  GetSwapMemeTransactionsByOutputArgsV2Instance,
  SwapMemeOutputV2,
} from "./types";
import { getNumeratorAndDenominator } from "./utils";
import BN from "bn.js";
import { getTokenInfoByMint } from "../config/helpers";
import { TokenInfo as SplTokenInfo } from "@solana/spl-token-registry";
import type { PoolState } from "@mercurial-finance/dynamic-amm-sdk";
import { AmmPool } from "../meteora/AmmPool";
import { MemechanClientV2 } from "../MemechanClientV2";
import { normalizeInputCoinAmountBN } from "../util/trading/normalizeInputCoinAmountBN";

export class LivePoolClientV2 {
  private constructor(
    public ammPool: AmmPool,
    public client: MemechanClientV2,
  ) {}

  public static getPoolState = async (ammId: PublicKey, connection: Connection) => {
    const { createProgram } = await import("@mercurial-finance/dynamic-amm-sdk/dist/cjs/src/amm/utils");
    const { ammProgram } = createProgram(connection);

    const poolState = (await ammProgram.account.pool.fetchNullable(ammId)) as unknown as PoolState;

    if (!poolState) {
      throw new Error(`Pool ${ammId.toBase58()} not found`);
    }

    return poolState;
  };

  public static getPoolStateFromAccountInfo = async (
    ammId: PublicKey,
    accountInfo: AccountInfo<Buffer>,
    connection: Connection,
  ) => {
    const { createProgram } = await import("@mercurial-finance/dynamic-amm-sdk/dist/cjs/src/amm/utils");
    const { ammProgram } = createProgram(connection);

    const poolState = ammProgram.account.pool.coder.accounts.decode<PoolState>("amm", accountInfo.data);

    if (!poolState) {
      throw new Error(`Pool ${ammId.toBase58()} not found`);
    }

    return poolState;
  };

  public static async fromAmmId(ammId: PublicKey, client: MemechanClientV2): Promise<LivePoolClientV2> {
    const connection = client.connection;
    const poolState = await LivePoolClientV2.getPoolState(ammId, connection);
    const memeMint = poolState.tokenAMint;

    console.log("poolState:", poolState);
    const memeTokenInfo: SplTokenInfo = {
      address: poolState.tokenAMint.toBase58(),
      decimals: MEMECHAN_MEME_TOKEN_DECIMALS,
      symbol: "MEME",
      name: "MEME",
      chainId: 900,
    };

    const quoteTokenInfo = getTokenInfoByMint(poolState.tokenBMint).toSplTokenInfo();

    console.log("quoteTokenInfo", quoteTokenInfo);

    const { default: AmmImpl } = await import("@mercurial-finance/dynamic-amm-sdk");

    const ammImpl = await AmmImpl.create(connection, ammId, memeTokenInfo, quoteTokenInfo);
    const ammPool = new AmmPool(ammId, memeMint, new PublicKey(ammImpl.tokenB.address), ammImpl);
    return new LivePoolClientV2(ammPool, client);
  }

  public static async fromAccountInfo(
    ammId: PublicKey,
    accountInfo: AccountInfo<Buffer>,
    client: MemechanClientV2,
  ): Promise<LivePoolClientV2> {
    const connection = client.connection;
    const poolState = await LivePoolClientV2.getPoolStateFromAccountInfo(ammId, accountInfo, connection);
    const memeMint = poolState.tokenAMint;

    console.log("poolState:", poolState);
    const memeTokenInfo: SplTokenInfo = {
      address: poolState.tokenAMint.toBase58(),
      decimals: MEMECHAN_MEME_TOKEN_DECIMALS,
      symbol: "MEME",
      name: "MEME",
      chainId: 900,
    };

    const quoteTokenInfo = getTokenInfoByMint(poolState.tokenBMint).toSplTokenInfo();

    console.log("quoteTokenInfo", quoteTokenInfo);

    const { default: AmmImpl } = await import("@mercurial-finance/dynamic-amm-sdk");

    const ammImpl = await AmmImpl.create(connection, ammId, memeTokenInfo, quoteTokenInfo);
    const ammPool = new AmmPool(ammId, memeMint, new PublicKey(ammImpl.tokenB.address), ammImpl);
    return new LivePoolClientV2(ammPool, client);
  }

  public static async getBuyMemeOutput({
    poolAddress,
    amountIn,
    slippagePercentage,
    connection,
  }: GetSwapMemeOutputArgs): Promise<SwapMemeOutputV2> {
    const poolState = await LivePoolClientV2.getPoolState(new PublicKey(poolAddress), connection);
    const memeMint = poolState.tokenAMint;

    const memeTokenInfo: SplTokenInfo = {
      address: memeMint.toBase58(),
      decimals: MEMECHAN_MEME_TOKEN_DECIMALS,
      symbol: "MEME",
      name: "MEME",
      chainId: 900,
    };

    const { default: AmmImpl } = await import("@mercurial-finance/dynamic-amm-sdk");

    const ammImpl = await AmmImpl.create(
      connection,
      new PublicKey(poolAddress),
      memeTokenInfo,
      TOKEN_INFOS.WSOL.toSplTokenInfo(),
    );
    const { numerator, denominator } = getNumeratorAndDenominator(slippagePercentage);
    const slippage = new BigNumber(numerator).dividedBy(new BigNumber(denominator)).toNumber();

    const quoteAmountIn = normalizeInputCoinAmountBN(amountIn, TOKEN_INFOS.WSOL.decimals);
    console.log("quoteAmountIn:", quoteAmountIn.toString());
    const { minSwapOutAmount } = ammImpl.getSwapQuote(TOKEN_INFOS.WSOL.mint, quoteAmountIn, slippage);

    return {
      minAmountOut: minSwapOutAmount,
      ammImpl: ammImpl,
      wrappedAmountIn: quoteAmountIn,
    };
  }

  public static async getBuyMemeTransactionsByOutput({
    wrappedAmountIn,
    inTokenMint,
    payer,
    minAmountOut,
    ammImpl,
  }: GetSwapMemeTransactionsByOutputArgsV2) {
    const swapTx = await ammImpl.swap(payer, inTokenMint, wrappedAmountIn, minAmountOut);

    const addPriorityFee = ComputeBudgetProgram.setComputeUnitPrice({
      microLamports: COMPUTE_UNIT_PRICE,
    });

    swapTx.instructions.unshift(addPriorityFee);

    return swapTx;
  }

  public static async getBuyMemeTransactions({
    poolAddress,
    memeCoinMint,
    amountIn,
    payer,
    slippagePercentage,
    connection,
  }: GetSwapMemeTransactionsArgsV2) {
    const { minAmountOut, ammImpl, wrappedAmountIn } = await LivePoolClientV2.getBuyMemeOutput({
      poolAddress,
      memeCoinMint,
      amountIn,
      connection,
      slippagePercentage,
    });

    const innerTransactions = await LivePoolClientV2.getBuyMemeTransactionsByOutput({
      minAmountOut,
      payer,
      ammImpl,
      wrappedAmountIn,
      inTokenMint: TOKEN_INFOS.WSOL.mint,
    });

    return innerTransactions;
  }

  public static async getSellMemeOutput({
    poolAddress,
    memeCoinMint,
    amountIn,
    slippagePercentage,
    connection,
  }: GetSwapMemeOutputArgs): Promise<SwapMemeOutputV2> {
    const memeTokenInfo: SplTokenInfo = {
      address: memeCoinMint,
      decimals: MEMECHAN_MEME_TOKEN_DECIMALS,
      symbol: "MEME",
      name: "MEME",
      chainId: 900,
    };
    const { default: AmmImpl } = await import("@mercurial-finance/dynamic-amm-sdk");
    const ammImpl = await AmmImpl.create(
      connection,
      new PublicKey(poolAddress),
      memeTokenInfo,
      TOKEN_INFOS.WSOL.toSplTokenInfo(),
    );
    const { numerator, denominator } = getNumeratorAndDenominator(slippagePercentage);
    const slippage = new BigNumber(numerator).dividedBy(new BigNumber(denominator)).toNumber();

    const memeAmountIn = normalizeInputCoinAmountBN(amountIn, MEMECHAN_MEME_TOKEN_DECIMALS);
    const { minSwapOutAmount } = ammImpl.getSwapQuote(new PublicKey(memeCoinMint), memeAmountIn, slippage);

    return {
      minAmountOut: minSwapOutAmount,
      ammImpl: ammImpl,
      wrappedAmountIn: memeAmountIn,
    };
  }

  public static async getSellMemeTransactionsByOutput({
    wrappedAmountIn,
    payer,
    minAmountOut,
    inTokenMint,
    ammImpl,
  }: GetSwapMemeTransactionsByOutputArgsV2) {
    const swapTx = await ammImpl.swap(payer, inTokenMint, wrappedAmountIn, minAmountOut);

    const addPriorityFee = ComputeBudgetProgram.setComputeUnitPrice({
      microLamports: COMPUTE_UNIT_PRICE,
    });

    swapTx.instructions.unshift(addPriorityFee);

    return swapTx;
  }

  public static async getSellMemeTransactions({
    poolAddress,
    memeCoinMint,
    amountIn,
    payer,
    slippagePercentage,
    connection,
  }: GetSwapMemeTransactionsArgsV2) {
    const { minAmountOut, ammImpl, wrappedAmountIn } = await LivePoolClientV2.getSellMemeOutput({
      poolAddress,
      memeCoinMint,
      amountIn,
      connection,
      slippagePercentage,
    });

    const innerTransactions = await LivePoolClientV2.getSellMemeTransactionsByOutput({
      minAmountOut,
      payer,
      ammImpl,
      wrappedAmountIn,
      inTokenMint: new PublicKey(memeCoinMint),
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
    const { default: AmmImpl } = await import("@mercurial-finance/dynamic-amm-sdk");

    const poolState = await LivePoolClientV2.getPoolState(new PublicKey(poolAddress), connection);
    const memeMint = poolState.tokenAMint;
    const tokenInfo = getTokenInfoByMint(memeMint);
    console.log("tokenInfo:", tokenInfo);

    const splMemeTokenInfo = tokenInfo.toSplTokenInfo();
    console.log("splMemeTokenInfo:", splMemeTokenInfo);

    const ammImpl = await AmmImpl.create(
      connection,
      new PublicKey(poolAddress),
      splMemeTokenInfo,
      TOKEN_INFOS.WSOL.toSplTokenInfo(),
    );
    const quoteAmountIn = new BN(1000 * 10 ** TOKEN_INFOS.WSOL.decimals);

    const { swapOutAmount } = ammImpl.getSwapQuote(
      TOKEN_INFOS.WSOL.mint,
      quoteAmountIn,
      0.0001, // 0.01% slippage
    );

    const memePriceInQuote = new BigNumber(quoteAmountIn.toString()).div(swapOutAmount.toString()).toString();
    const memePriceInUsd = new BigNumber(memePriceInQuote).multipliedBy(quotePriceInUsd).toString();

    return { priceInQuote: memePriceInQuote, priceInUsd: memePriceInUsd };
  }

  public static async getQuoteTokenDisplayName(ammId: PublicKey, client: MemechanClientV2) {
    const pool = await LivePoolClientV2.fromAmmId(ammId, client);
    const quoteToken = getTokenInfoByMint(pool.ammPool.quoteMint);
    return quoteToken.displayName;
  }

  // Instance methods

  public async getPoolState() {
    return await LivePoolClientV2.getPoolState(this.ammPool.id, this.client.connection);
  }

  public async getBuyMemeOutput(args: GetSwapMemeOutputArgs): Promise<SwapMemeOutputV2> {
    return await LivePoolClientV2.getBuyMemeOutput(args);
  }

  public async getBuyMemeTransactions(args: GetSwapMemeTransactionsArgs): Promise<Transaction> {
    return await LivePoolClientV2.getBuyMemeTransactions(args);
  }

  public async getSellMemeOutput(args: GetSwapMemeOutputArgs): Promise<SwapMemeOutputV2> {
    return await LivePoolClientV2.getSellMemeOutput(args);
  }

  public async getSellMemeTransactions(args: GetSwapMemeTransactionsArgsV2): Promise<Transaction> {
    return await LivePoolClientV2.getSellMemeTransactions(args);
  }

  public async getMemePrice(args: { poolAddress: string; quotePriceInUsd: number; connection: Connection }) {
    return await LivePoolClientV2.getMemePrice(args);
  }

  public async getQuoteTokenDisplayName() {
    return await LivePoolClientV2.getQuoteTokenDisplayName(this.ammPool.id, this.client);
  }

  public async getBuyMemeTransactionsByOutput({
    wrappedAmountIn,
    inTokenMint,
    payer,
    minAmountOut,
  }: GetSwapMemeTransactionsByOutputArgsV2Instance) {
    const swapTx = await this.ammPool.ammImpl.swap(payer, inTokenMint, wrappedAmountIn, minAmountOut);
    const addPriorityFee = ComputeBudgetProgram.setComputeUnitPrice({
      microLamports: COMPUTE_UNIT_PRICE,
    });

    swapTx.instructions.unshift(addPriorityFee);

    return swapTx;
  }

  public async getSellMemeTransactionsByOutput({
    wrappedAmountIn,
    payer,
    minAmountOut,
    inTokenMint,
  }: GetSwapMemeTransactionsByOutputArgsV2Instance) {
    const swapTx = await this.ammPool.ammImpl.swap(payer, inTokenMint, wrappedAmountIn, minAmountOut);

    const addPriorityFee = ComputeBudgetProgram.setComputeUnitPrice({
      microLamports: COMPUTE_UNIT_PRICE,
    });

    swapTx.instructions.unshift(addPriorityFee);

    return swapTx;
  }
}
