import { OffchainMetadata } from "../api/types";
import { deserializeMetadata, Metadata } from "@metaplex-foundation/mpl-token-metadata";
import { lamports, publicKey } from "@metaplex-foundation/umi";
import { Connection, PublicKey } from "@solana/web3.js";

export class MetadataClient {
  static async fetchMetadata(
    metadataAddress: PublicKey,
    connection: Connection,
  ): Promise<{ mplMetadata: Metadata; offchainMetadata: OffchainMetadata } | undefined> {
    const metaAccountInfo = await connection.getAccountInfo(metadataAddress, {
      commitment: "confirmed",
    });

    if (!metaAccountInfo) {
      console.log("Failed to fetch metadata account info " + metadataAddress.toBase58());
      return undefined;
    }

    const mplMetadata = deserializeMetadata({
      executable: false,
      owner: publicKey(metaAccountInfo.owner.toBase58()),
      lamports: lamports(metaAccountInfo.lamports),
      publicKey: publicKey(metadataAddress.toBase58()),
      data: metaAccountInfo.data,
    });

    const offChainMetadataResponse = await fetch(mplMetadata.uri);

    if (!offChainMetadataResponse.ok) {
      console.log("Failed to fetch offchain metadata for", mplMetadata.uri);
      return undefined;
    }

    const offchainMetadata = JSON.parse(await offChainMetadataResponse.json()) as OffchainMetadata;
    if (!offchainMetadata) {
      console.log("Failed to parse offchain metadata for", mplMetadata.uri);
      return undefined;
    }

    return { mplMetadata, offchainMetadata };
  }
}
