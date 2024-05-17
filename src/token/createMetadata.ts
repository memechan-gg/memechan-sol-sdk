import { PublicKey, SYSVAR_RENT_PUBKEY, Signer, SystemProgram } from "@solana/web3.js";
import { MemechanClient } from "../MemechanClient";
import { TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { CoinAPI } from "../coin/CoinAPI";

//  https://github.com/metaplex-foundation/metaplex-program-library/blob/caeab0f7/token-metadata/js/src/generated/index.ts#L13
const TOKEN_METADATA_PROGRAM_ID = new PublicKey("metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s");

export async function createMetadata(
  client: MemechanClient,
  payer: Signer,
  mint: PublicKey,
  poolId: PublicKey,
  poolSigner: PublicKey,
): Promise<string> {
  const metadata = {
    name: "Best Token Ever",
    symbol: "BTE",
    image: "https://cf-ipfs.com/ipfs/QmVevMfxFpfgBu5kHuYUPmDMaV6pWkAn3zw5XaCXxKdaBh",
    description: "This is the best token ever",
    twitter: "https://twitter.com/BestTokenEver",
    telegram: "https://t.me/BestTokenEver",
    website: "https://besttokenever.com",
  };

  const metadataBlob = new Blob([JSON.stringify(metadata)], { type: "application/json" });
  const fileName = "metadata.json";
  const metadataFile = new File([metadataBlob], fileName);

  const coinApi = new CoinAPI();
  const fileUploadResult = await coinApi.uploadFile(metadataFile);

  const metadataUri = "https://cf-ipfs.com/ipfs/" + fileUploadResult.IpfsHash;

  console.log("metadataUri: " + metadataUri);

  const pda = findMetadataPDA(mint);

  console.log("poolsigner: " + poolSigner.toBase58());
  console.log("pda: " + pda.toBase58());
  console.log("payer: " + payer.publicKey.toBase58());
  console.log("poolId: " + poolId.toBase58());
  console.log("mint: " + mint.toBase58());

  // Prepare the transaction to initialize the counter
  const tx = await client.memechanProgram.methods
    .createMetadata("Test Token", "TT", metadataUri)
    .accounts({
      pool: poolId,
      poolSigner: poolSigner,
      memeMplMetadata: pda,
      sender: payer.publicKey,
      rent: SYSVAR_RENT_PUBKEY,
      memeMint: mint,
      metadataProgram: TOKEN_METADATA_PROGRAM_ID,
      systemProgram: SystemProgram.programId,
      tokenProgram: TOKEN_PROGRAM_ID,
    })
    .signers([payer])
    .rpc();

  console.log("Transaction signature", tx);
  return tx;
}

export function findMetadataPDA(mint: PublicKey) {
  const seeds = [Buffer.from("metadata"), TOKEN_METADATA_PROGRAM_ID.toBuffer(), mint.toBuffer()];
  const [pda] = PublicKey.findProgramAddressSync(seeds, TOKEN_METADATA_PROGRAM_ID);
  return pda;
}
