import { z } from "zod";
import { PublicKey, Keypair } from "@solana/web3.js";

// Helper schemas
const PublicKeySchema = z.string().refine(
  (value) => {
    try {
      new PublicKey(value);
      return true;
    } catch {
      return false;
    }
  },
  { message: "Invalid public key" },
);

const KeypairSchema = z.string().refine(
  (value) => {
    try {
      const keypair = Keypair.fromSecretKey(Buffer.from(value, "base64"));
      return keypair instanceof Keypair;
    } catch {
      return false;
    }
  },
  { message: "Invalid keypair" },
);

// Schema for GetBuyMemeTransactionArgs
const GetBuyMemeTransactionArgsSchema = z.object({
  user: PublicKeySchema,
  inputTokenAccount: PublicKeySchema.optional(),
  inputAmount: z.string(),
  minOutputAmount: z.string(),
  slippagePercentage: z.number(),
  memeTicketNumber: z.number(),
});

// Schema for TokenMetadata
const TokenMetadataSchema = z.object({
  name: z.string(),
  symbol: z.string(),
  image: z.string(),
  description: z.string(),
  twitter: z.string(),
  telegram: z.string(),
  website: z.string(),
  discord: z.string(),
});

// Schema for GetCreateNewBondingPoolAndTokenTransactionArgsV2
const GetCreateNewBondingPoolAndTokenTransactionArgsV2Schema = z.object({
  admin: PublicKeySchema,
  quoteToken: z.any(),
  tokenMetadata: TokenMetadataSchema,
  payer: PublicKeySchema,
});

// Schema for GetCreateNewBondingPoolAndTokenWithBuyMemeTransactionArgsV2
const getCreateNewBondingPoolAndTokenWithBuyMemeTransactionArgsV2 =
  GetCreateNewBondingPoolAndTokenTransactionArgsV2Schema.extend({
    buyMemeTransactionArgs: GetBuyMemeTransactionArgsSchema.optional(),
    memeMintKeypair: KeypairSchema.optional(),
  });

// Export the schema
export { getCreateNewBondingPoolAndTokenWithBuyMemeTransactionArgsV2 };
export type GetCreateNewBondingPoolAndTokenWithBuyMemeTransactionArgsV2Schema = z.infer<
  typeof getCreateNewBondingPoolAndTokenWithBuyMemeTransactionArgsV2
>;
