import { ApiPoolInfoV4, CurrencyAmount, TokenAccount, TokenAmount, jsonInfo2PoolKeys } from "@raydium-io/raydium-sdk";
import { Connection, PublicKey } from "@solana/web3.js";
import BN from "bn.js";

import type AmmImpl from "@mercurial-finance/dynamic-amm-sdk";

export type SwapMemeOutputV2 = {
  minAmountOut: BN;
  ammImpl: AmmImpl;
  wrappedAmountIn: BN;
};

export type GetSwapMemeTransactionsByOutputArgsV2 = SwapMemeOutputV2 & {
  inTokenMint: PublicKey;
  payer: PublicKey;
};

export type GetSwapMemeTransactionsByOutputArgsV2Instance = {
  inTokenMint: PublicKey;
  payer: PublicKey;
  wrappedAmountIn: BN;
  minAmountOut: BN;
};

export type GetSwapMemeTransactionsArgsV2 = GetSwapMemeOutputArgs & {
  payer: PublicKey;
};

export type GetSwapMemeOutputArgs = {
  poolAddress: string;
  memeCoinMint: string;
  amountIn: string;
  slippagePercentage: number;
  connection: Connection;
};

export type SwapMemeOutput = {
  minAmountOut: CurrencyAmount | TokenAmount;
  poolKeys: PoolKeysV4;
  wrappedAmountIn: TokenAmount;
};

export type GetSwapMemeTransactionsByOutputArgs = SwapMemeOutput & {
  connection: Connection;
  walletTokenAccounts: TokenAccount[];
  payer: PublicKey;
};

export type GetSwapMemeTransactionsArgs = GetSwapMemeOutputArgs & {
  payer: PublicKey;
  walletTokenAccounts: TokenAccount[];
};

export type PoolKeysV4 = ReturnType<typeof jsonInfo2PoolKeys<ApiPoolInfoV4>>;
