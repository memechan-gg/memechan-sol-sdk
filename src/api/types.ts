import { PublicKey, Signer } from "@solana/web3.js";
import { z, ZodRawShape } from "zod";
import { SolanaToken, solanaTokenHolderSchema, solanaTokenSchema } from "./schemas/token-schemas";
import { solanaLivePool, SolanaSeedPool, solanaSeedPool, solanaStakingPool } from "./schemas/pools-schema";
import BN from "bn.js";

export interface TokenMetadata {
  name: string;
  symbol: string;
  image: string;
  description: string;
  twitter: string;
  telegram: string;
  website: string;
  discord: string;
}

export interface CreateMetadataInfo {
  metadata: TokenMetadata;
  payer: Signer;
  mint: PublicKey;
  poolId: PublicKey;
  poolSigner: PublicKey;
}

const paginatedResultSchema = <T extends ZodRawShape>(result: z.ZodObject<T>) =>
  z.object({
    paginationToken: z.string().nullish(),
    result: z.array(result),
  });

export const paginatedTokenResultSchema = () => paginatedResultSchema(solanaTokenSchema);
export type QueryTokensResponse = z.infer<ReturnType<typeof paginatedTokenResultSchema>>;

export const paginatedSeedPoolsResultSchema = () => paginatedResultSchema(solanaSeedPool);
export type QueryAllSeedPoolsResponse = z.infer<ReturnType<typeof paginatedSeedPoolsResultSchema>>;

export const paginatedLivePoolsResultSchema = () => paginatedResultSchema(solanaLivePool);
export type QueryAllLivePoolsResponse = z.infer<ReturnType<typeof paginatedLivePoolsResultSchema>>;

export const paginatedStakingPoolsResultSchema = () => paginatedResultSchema(solanaStakingPool);
export type QueryAllStakingPoolsResponse = z.infer<ReturnType<typeof paginatedStakingPoolsResultSchema>>;

export type GetTokenResponse = SolanaToken;

export type GetSeedPool = SolanaSeedPool;

export type UploadFileResponse = {
  IpfsHash: string;
  PinSize: number;
  Timestamp: string;
  isDuplicate: boolean;
};

export type CreateTokenResponse = {
  token: SolanaToken;
};

export type CreateBoundPoolTransactionResponse = {
  serializedTransaction: Uint8Array;
};

export const paginatedHoldersResultSchema = () => paginatedResultSchema(solanaTokenHolderSchema);
export type QueryHoldersByTokenAddressResponse = z.infer<ReturnType<typeof paginatedHoldersResultSchema>>;

export type ConvertedHolderItem = {
  owner: PublicKey;
  pool: PublicKey;
  amount: BN;
  percetange: number; // Assuming tokenAmountInPercentage is a number
};

export type ConvertedHolderMap = Map<string, ConvertedHolderItem>;
