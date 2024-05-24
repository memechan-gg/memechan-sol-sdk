import { z } from "zod";

export const querySolanaSeedPoolsParams = z.object({
  tokenAddress: z.string().nullish(),
  seedPoolId: z.string().nullish(),
  paginationToken: z.string().nullish(),
});

export const querySolanaStakingPoolsParams = z.object({
  tokenAddress: z.string().nullish(),
  stakingPoolId: z.string().nullish(),
  paginationToken: z.string().nullish(),
});

export const querySolanaLivePoolsParams = z.object({
  tokenAddress: z.string().nullish(),
  livePoolId: z.string().nullish(),
  paginationToken: z.string().nullish(),
});

export const solanaSeedPool = z.object({
  address: z.string(),
  tokenAddress: z.string(),
  createdTime: z.number(),
  txDigest: z.string(),
});

export const solanaSeedPoolRecord = solanaSeedPool.extend({
  pk: z.literal("SOLANA_SEED_POOL"),
  sk: z.string(),
  "lsi-string-0": z.string(),
  "lsi-numeric-0": z.number(),
});

export const seedPoolRecord = solanaSeedPool.extend({
  pk: z.literal("SEED_POOL"),
  sk: z.string(),
  "lsi-string-0": z.string(),
  "lsi-numeric-0": z.number(),
});

export const solanaLivePool = z.object({
  address: z.string(),
  isStable: z.boolean(),
  tokenAddress: z.string(),
  a: z.number().or(z.bigint()),
  futureA: z.number().or(z.bigint()),
  gamma: z.number().or(z.bigint()),
  initialTime: z.number().or(z.bigint()),
  futureGamma: z.number().or(z.bigint()),
  futureTime: z.number().or(z.bigint()),
  balances: z.array(z.number().or(z.bigint())),
  d: z.number().or(z.bigint()),
  lastPriceTimestamp: z.number().or(z.bigint()),
  lpCoinSupply: z.number().or(z.bigint()),
  maxA: z.number().or(z.bigint()),
  minA: z.number().or(z.bigint()),
  nCoins: z.number().or(z.bigint()),
  virtualPrice: z.number().or(z.bigint()),
  xcpProfit: z.number().or(z.bigint()),
  xcpProfitA: z.number().or(z.bigint()),
  notAdjusted: z.boolean(),
  txDigest: z.string(),
  creationDate: z.number(),
});

export const solanaStakingPool = z.object({
  address: z.string(),
  tokeAddress: z.string(),
  lpMint: z.string(),
  lpVault: z.string(),
  memeVault: z.string(),
  quoteVault: z.string(),
  creationDate: z.number(),
  txDigest: z.string(),
});

export const solanaLivePoolRecord = solanaLivePool.extend({
  pk: z.literal("SOLANA_LIVE_POOL"),
  sk: z.string(),
  "lsi-string-0": z.string(),
  "lsi-numeric-0": z.number(),
});

export const solanaStakingPoolRecord = solanaStakingPool.extend({
  pk: z.literal("SOLANA_STAKING_POOL"),
  sk: z.string(),
  "lsi-string-0": z.string(),
  "lsi-numeric-0": z.number(),
});

export type SolanaSeedPool = z.infer<typeof solanaSeedPool>;
export type SolanaLivePool = z.infer<typeof solanaLivePool>;
export type QuerySolanaSeedPoolsParams = z.infer<typeof querySolanaSeedPoolsParams>;
export type QuerySolanaLivePoolsParams = z.infer<typeof querySolanaLivePoolsParams>;
export type QuerySolanaStakingPoolsParams = z.infer<typeof querySolanaStakingPoolsParams>;
export type SolanaStakingPoolData = z.infer<typeof solanaStakingPool>;