import { PublicKey, SYSVAR_RENT_PUBKEY, SystemProgram, Transaction, sendAndConfirmTransaction } from "@solana/web3.js";
import { CreateMetadataInfo } from "../api/types";
import { uploadMetadataToIpfs } from "../api/uploadMetadataToIpfs";
import { MemechanClientV2 } from "../MemechanClientV2";

// eslint-disable-next-line max-len
// https://github.com/metaplex-foundation/metaplex-program-library/blob/caeab0f7/token-metadata/js/src/generated/index.ts#L13
const TOKEN_METADATA_PROGRAM_ID = new PublicKey("metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s");

export async function createMetadataV2(client: MemechanClientV2, input: CreateMetadataInfo): Promise<string> {
  const createMetadataTransaction = await getCreateMetadataTransactionV2(
    client,
    {
      ...input,
      payer: input.payer.publicKey,
    },
    false,
  );

  const signature = await sendAndConfirmTransaction(client.connection, createMetadataTransaction, [input.payer], {
    skipPreflight: true,
    commitment: "confirmed",
    preflightCommitment: "confirmed",
  });

  console.log("Transaction signature", signature);
  return signature;
}

export async function getCreateMetadataTransactionV2(
  client: MemechanClientV2,
  input: Omit<CreateMetadataInfo, "payer"> & { payer: PublicKey },
  isSimulated: boolean,
): Promise<Transaction> {
  const metadata = input.metadata;
  const metadataUri = isSimulated ? "" : await uploadMetadataToIpfs(metadata);
  const pda = findMetadataPDA(input.mint);
  const { TOKEN_PROGRAM_ID } = await import("@solana/spl-token");
  // Prepare the transaction to initialize the counter
  const tx = client.memechanProgram.methods
    .createMetadata(metadata.name, metadata.symbol, metadataUri)
    .accounts({
      pool: input.poolId,
      poolSigner: input.poolSigner,
      memeMplMetadata: pda,
      sender: input.payer,
      rent: SYSVAR_RENT_PUBKEY,
      memeMint: input.mint,
      metadataProgram: TOKEN_METADATA_PROGRAM_ID,
      systemProgram: SystemProgram.programId,
      tokenProgram: TOKEN_PROGRAM_ID,
    })
    .transaction();

  return tx;
}

export function findMetadataPDA(mint: PublicKey) {
  const seeds = [Buffer.from("metadata"), TOKEN_METADATA_PROGRAM_ID.toBuffer(), mint.toBuffer()];
  const [pda] = PublicKey.findProgramAddressSync(seeds, TOKEN_METADATA_PROGRAM_ID);
  return pda;
}
