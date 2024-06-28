import AmmImpl from "@mercurial-finance/dynamic-amm-sdk";
import { ApiPoolInfoV4, CurrencyAmount, TokenAccount, TokenAmount, jsonInfo2PoolKeys } from "@raydium-io/raydium-sdk";
import { Connection, PublicKey } from "@solana/web3.js";
import BN from "bn.js";

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

export type SwapMemeOutputV2 = {
  minAmountOut: BN;
  ammImpl: AmmImpl;
  wrappedAmountIn: BN;
};

export type GetSwapMemeTransactionsByOutputArgs = SwapMemeOutput & {
  connection: Connection;
  walletTokenAccounts: TokenAccount[];
  payer: PublicKey;
};

export type GetSwapMemeTransactionsByOutputArgsV2 = SwapMemeOutputV2 & {
  inTokenMint: PublicKey;
  payer: PublicKey;
};

export type GetSwapMemeTransactionsArgs = GetSwapMemeOutputArgs & {
  payer: PublicKey;
  walletTokenAccounts: TokenAccount[];
};

export type GetSwapMemeTransactionsArgsV2 = GetSwapMemeOutputArgs & {
  payer: PublicKey;
};

export type PoolKeysV4 = ReturnType<typeof jsonInfo2PoolKeys<ApiPoolInfoV4>>;
