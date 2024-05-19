import { PublicKey, Signer } from "@solana/web3.js";

export interface TokenMetadata {
    name: string;
    symbol: string;
    image: string;
    description: string;
    twitter: string;
    telegram: string;
    website: string;
}

export interface CreateMetadataInfo {
    metadata: TokenMetadata;
    payer: Signer,
    mint: PublicKey,
    poolId: PublicKey,
    poolSigner: PublicKey,
}