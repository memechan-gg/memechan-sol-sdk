import { PublicKey, SystemProgram } from "@solana/web3.js";
import { MemechanClient } from "../MemechanClient";
import { CreateTargetConfigArgs } from "./types";
import BN from "bn.js";
import { payer } from "../../examples/common";

export class TargetConfig {
  public constructor(
    public id: PublicKey,
    public client: MemechanClient,
    public tokenMint: PublicKey,
    public tokenTargetAmount: BN,
  ) {
    //
  }

  public static async fromTargetConfigId({
    client,
    accountAddressId,
  }: {
    client: MemechanClient;
    accountAddressId: PublicKey;
  }) {
    const objectData = await client.memechanProgram.account.targetConfig.fetch(accountAddressId);

    console.log("objectData:", objectData);

    const instance = new TargetConfig(
      accountAddressId,
      client,
      objectData.tokenMint,
      objectData.tokenTargetAmount
    );

    return instance;
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

    return new TargetConfig(pda, input.client, input.mint, input.targetAmount);
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

  public async changeTargetConfig(targetAmount: BN) {
    const result = await this.client.memechanProgram.methods
    .changeTargetConfig(
      targetAmount
    )
    .accounts({
      sender: payer.publicKey,
      targetConfig: this.id,
    })
    .signers([payer])
    .rpc({ skipPreflight: true });

    console.log("changeTargetConfig result", result);
  }
}