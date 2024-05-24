import { z, ZodRawShape } from "zod";
import { coinStatus } from "./coin-schema";

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
  txDigest: z.string(),
  socialLinks: solanaSocialLinks,
});

export const querySolanaTokensRequestParamsSchema = z.object({
  sortBy: solanaTokensSortableColumns,
  direction: z.literal("asc").or(z.literal("desc")),
  paginationToken: z.string().nullish(),
});

export const solanaTokenSchema = z.object({
  name: z.string().optional(),
  address: z.string(),
  decimals: z.number(),
  symbol: z.string().optional(),
  description: z.string().optional(),
  image: z.string().optional(),
  lastReply: z.number(),
  marketcap: z.number(),
  creator: z.string(),
  status: coinStatus,
  socialLinks: solanaSocialLinks.nullish(),
  txDigest: z.string(),
  creationTime: z.number(),
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

export type SolanaTokenMetadata = z.infer<typeof solanaTokenMetadata>;
export type SolanaToken = z.infer<typeof solanaTokenSchema>;
export type SolanaTokenRecordItem = z.infer<typeof solanaTokenRecordSchema>;
export type SortableColumn = z.infer<typeof solanaTokensSortableColumns>;
export type QuerySolanaTokensRequestParams = z.infer<typeof querySolanaTokensRequestParamsSchema>;
export type SolanaSocialLinks = z.infer<typeof solanaSocialLinks>;
export type CoinStatus = z.infer<typeof coinStatus>;
export type TicketStatus = z.infer<typeof coinStatus>;