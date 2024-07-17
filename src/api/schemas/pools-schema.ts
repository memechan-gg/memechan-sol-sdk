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
  locked: z.string(),
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
  id: z.string(),
  baseMint: z.string(),
  quoteMint: z.string(),
  lpMint: z.string(),
  baseDecimals: z.number(),
  quoteDecimals: z.number(),
  lpDecimals: z.number(),
  version: z.number(),
  programId: z.string(),
  authority: z.string(),
  openOrders: z.string(),
  targetOrders: z.string(),
  baseVault: z.string(),
  quoteVault: z.string(),
  withdrawQueue: z.string(),
  lpVault: z.string(),
  marketVersion: z.number(),
  marketProgramId: z.string(),
  marketId: z.string(),
  marketAuthority: z.string(),
  marketBaseVault: z.string(),
  marketQuoteVault: z.string(),
  marketBids: z.string(),
  marketAsks: z.string(),
  marketEventQueue: z.string(),
  lookupTableAccount: z.string(),
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
