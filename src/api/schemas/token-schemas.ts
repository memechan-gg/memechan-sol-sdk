import { z, ZodRawShape } from "zod";
import { tokenStatus } from "./token-status-schema";

export const paginatedResultSchema = <T extends ZodRawShape>(result: z.ZodObject<T>) =>
  z.object({
    paginationToken: z.string().nullish(),
    result: z.array(result),
  });

export const solanaTokensSortableColumns = z
  .literal("marketcap")
  .or(z.literal("creationTime"))
  .or(z.literal("lastReply"));

export const solanaSocialLinks = z.object({
  telegram: z.string().nullish(),
  website: z.string().nullish(),
  twitter: z.string().nullish(),
  discord: z.string().nullish(),
});

export const createSolanaTokenRequestBodySchema = z.object({
  txDigests: z.array(z.string()),
  socialLinks: solanaSocialLinks,
});

// old one
export const querySolanaTokensRequestParamsSchema = z.object({
  sortBy: solanaTokensSortableColumns,
  status: z.literal("PRESALE").or(z.literal("LIVE")), // ?
  direction: z.literal("asc").or(z.literal("desc")),
  paginationToken: z.string().nullish(),
});

export const solanaTokenSchema = z.object({
  name: z.string(),
  address: z.string(),
  decimals: z.number(),
  symbol: z.string(),
  description: z.string(),
  image: z.string(),
  lastReply: z.number(),
  marketcap: z.number(),
  creator: z.string(),
  status: tokenStatus,
  socialLinks: solanaSocialLinks.nullish(),
  txDigest: z.string(),
  creationTime: z.number(),
  holdersCount: z.number().optional(),
  slerfIn: z.string().nullish(),
});

export const solanaTokenMetadata = z.object({
  decimals: z.number(),
  description: z.string(),
  icon_url: z.string(),
  name: z.string(),
  symbol: z.string(),
});

export const solanaTokenRecordSchema = solanaTokenSchema.extend({
  pk: z.literal("SOLANA_TOKEN#LIVE").or(z.literal("SOLANA_TOKEN#PRESALE")),
  sk: z.string(),
  "lsi-string-0": z.string(),
  "lsi-string-1": z.string(),
  "lsi-numeric-0": z.number(),
  "lsi-numeric-1": z.number(),
  "lsi-numeric-2": z.number(),
});

export const createCoinRequestBodySchema = z.object({
  txDigests: z.array(z.string()),
  socialLinks: solanaSocialLinks.nullish(),
});

export const createTokenRequestBodySchema = z.object({
  txDigests: z.array(z.string()),
  socialLinks: solanaSocialLinks.nullish(),
});

export const solanaTokenHoldersByTokenAddressRequest = z.object({
  tokenAddress: z.string(),
  paginationToken: z.string().optional(),
  direction: z.literal("asc").or(z.literal("desc")),
  sortBy: z.literal("tokenAmount").or(z.literal("tokenAmountInPercentage")),
});

export const solanaTokenHolderSchema = z.object({
  walletAddress: z.string(),
  tokenAddress: z.string(),
  tokenAmount: z.string(),
  tokenAmountInPercentage: z.number(),
});

export type SolanaTokenMetadata = z.infer<typeof solanaTokenMetadata>;
export type SolanaToken = z.infer<typeof solanaTokenSchema>;
export type SolanaTokenRecordItem = z.infer<typeof solanaTokenRecordSchema>;
export type SortableColumn = z.infer<typeof solanaTokensSortableColumns>;
export type QuerySolanaTokensRequestParams = z.infer<typeof querySolanaTokensRequestParamsSchema>;
export type SolanaSocialLinks = z.infer<typeof solanaSocialLinks>;
export type CoinStatus = z.infer<typeof tokenStatus>;
export type TokenStatus = z.infer<typeof tokenStatus>;
export type TicketStatus = z.infer<typeof tokenStatus>;
export type QueryTokensRequestParams = z.infer<typeof querySolanaTokensRequestParamsSchema>;
export type CreateTokenRequestBody = z.infer<typeof createTokenRequestBodySchema>;
export type SolanaTokenHoldersByTokenAddressRequest = z.infer<typeof solanaTokenHoldersByTokenAddressRequest>;
