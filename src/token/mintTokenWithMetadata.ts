import { Keypair, PublicKey, SYSVAR_RENT_PUBKEY, SystemProgram } from "@solana/web3.js";
import { MemechanClient } from "../MemechanClient";
import { ATA_PROGRAM_ID } from "../raydium/config";
import { TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { BN } from "@coral-xyz/anchor";

export async function mintTokenWithMetadata(client: MemechanClient, payer: Keypair): Promise<string> {

  const programId = client.memechanProgram.programId;
  const counterPda = findCounterPDA(programId);
  const counterValue = 0;

  // Convert counter value to little-endian bytes
  const counterBytes = new BN(counterValue).toArrayLike(Buffer, 'le', 8);

  // Derive the mint PDA
  const [mintPda, mintBump] = PublicKey.findProgramAddressSync(
    [Buffer.from('token'), counterBytes],
    programId
  );

  // Derive the metadata PDA
  const [metadataPda, metadataBump] = PublicKey.findProgramAddressSync(
    [Buffer.from('metadata'), counterBytes],
    programId
  );

  console.log("Counter PDA", counterPda.toBase58());
  console.log("Mint", mintPda.toBase58());
  console.log("Metadata", metadataPda.toBase58());

  // Prepare the transaction to initialize the counter
  const tx = await client.memechanProgram.methods.mintTokenWithMetadata(
    "Test Token",
    "TT",
    "www.memechan.gg",
    "description of the token",
     "twitter.com/memechan_gg",
    "tg.com/memechan_gg"
  ).accounts(
      {
          mint: mintPda,
          rent: SYSVAR_RENT_PUBKEY,
          metadata: metadataPda,
          metadataProgram: new PublicKey("metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s"), // https://github.com/metaplex-foundation/metaplex-program-library/blob/caeab0f7/token-metadata/js/src/generated/index.ts#L13
          splAtaProgram: ATA_PROGRAM_ID,
          counter: counterPda,
          payer: payer.publicKey,
          systemProgram: SystemProgram.programId,
          tokenProgram: TOKEN_PROGRAM_ID,
      })
      .signers([payer])
      .rpc();


  console.log("Transaction signature", tx);
  return tx;
}

export function findCounterPDA(programId: PublicKey) {
    const seeds = [Buffer.from("counter")];
    const [pda] = PublicKey.findProgramAddressSync(seeds, programId);
    return pda;
}

export function findMintPDA(programId: PublicKey, counterValue: number) {
    const seeds = [Buffer.from("token"), Buffer.from(Uint8Array.of(counterValue))];
    const [pda] = PublicKey.findProgramAddressSync(seeds, programId);
    return pda;
}

export function findMetadataPDA(programId: PublicKey, counterValue: number) {
    const seeds = [Buffer.from("metadata"), Buffer.from(Uint8Array.of(counterValue))];
    const [pda] = PublicKey.findProgramAddressSync(seeds, programId);
    return pda;
}
