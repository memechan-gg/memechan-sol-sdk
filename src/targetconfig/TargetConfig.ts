import { PublicKey, SystemProgram } from "@solana/web3.js";
import { MemechanClient } from "../MemechanClient";
import { CreateTargetConfigArgs } from "./types";

export class TargetConfig {
  public constructor(
    public id: PublicKey,
    public client: MemechanClient,
  ) {
    //
  }

  public async fetch(program = this.client.memechanProgram) {
    return program.account.targetConfig.fetch(this.id);
  }

  public static async new(input: CreateTargetConfigArgs) {

    const pda = this.findTargetConfigPda(input.mint, input.client.memechanProgram.programId);

    const result = await input.client.memechanProgram.methods
    .newTargetConfig(
      input.targetAmount
    )
    .accounts({
      mint: input.mint,
      sender: input.payer.publicKey,
      targetConfig: pda,
      systemProgram: SystemProgram.programId,
    })
    .signers([input.payer])
    .rpc({ skipPreflight: true });

    console.log("newTargetConfig result", result);

    return new TargetConfig(pda, input.client);
  }

  public static findTargetConfigPda(
    memeMintPubkey: PublicKey,
    memechanProgramId: PublicKey,
  ): PublicKey {
    return PublicKey.findProgramAddressSync(
      [Buffer.from("config"), memeMintPubkey.toBytes()],
      memechanProgramId,
    )[0];
  }
}