import { Keypair, PublicKey, SystemProgram } from "@solana/web3.js";
import { MemechanClient } from "../MemechanClient";

export async function mintTokenWithMetadata(client: MemechanClient, payer: Keypair) {

  const programId = client.memechanProgram.programId;
  const counterPda = findCounterPDA(programId, 0);

  // Prepare the transaction to initialize the counter
  const tx = await client.memechanProgram.methods.mintTokenWithMetadata(
    name: "Test Token",
  ).accounts(
      {
          counter: counterPda,
          payer: payer.publicKey,
          systemProgram: SystemProgram.programId,
      })
      .signers([payer])
      .rpc();

  console.log("Transaction signature", tx);
}

export function findCounterPDA(programId: PublicKey, counterValue: number) {
    const seeds = [Buffer.from("counter"), Buffer.from(Uint8Array.of(counterValue))];
    const [pda] = PublicKey.findProgramAddressSync(seeds, programId);
    return pda;
}

