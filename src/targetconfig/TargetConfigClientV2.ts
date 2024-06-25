import {
  ComputeBudgetProgram,
  Connection,
  Keypair,
  PublicKey,
  SystemProgram,
  Transaction,
  sendAndConfirmTransaction,
} from "@solana/web3.js";
import BN from "bn.js";
import { MemechanClientV2 } from "../MemechanClientV2";
import { COMPUTE_UNIT_PRICE } from "../config/config";
import { TargetConfig as CodegenTargetConfig } from "../schema/v2/codegen/accounts";
import { getSendAndConfirmTransactionMethod } from "../util/getSendAndConfirmTransactionMethod";
import { CreateTargetConfigArgsV2 } from "./types";

export class TargetConfigClientV2 {
  public constructor(
    public id: PublicKey,
    public client: MemechanClientV2,
    public tokenMint: PublicKey,
    public tokenTargetAmount: BN,
  ) {
    //
  }

  public static async fromTargetConfigId({
    client,
    accountAddressId,
  }: {
    client: MemechanClientV2;
    accountAddressId: PublicKey;
  }) {
    const objectData = await TargetConfigClientV2.fetch(client.connection, accountAddressId);

    console.log("objectData:", objectData);

    const instance = new TargetConfigClientV2(
      accountAddressId,
      client,
      objectData.tokenMint,
      objectData.tokenTargetAmount,
    );

    return instance;
  }

  // public async fetch(program = this.client.memechanProgram) {
  //   return program.account.targetConfig.fetch(this.id, "confirmed");
  // }

  /**
   * Fetches the bound pool account information.
   *
   * @param {Connection} connection - The Solana RPC connection.
   * @param {PublicKey} accountId - The ID of the account to fetch.
   * @returns {Promise<T>} - The account information.
   */
  static async fetch(connection: Connection, accountId: PublicKey) {
    const accountInfo = await CodegenTargetConfig.fetch(connection, accountId);

    if (!accountInfo) {
      throw new Error(`[TargetConfigClient.fetch] No account info found for ${accountId}`);
    }

    return accountInfo;
  }

  public static async new(input: CreateTargetConfigArgsV2) {
    const pda = this.findTargetConfigPda(input.mint, input.client.memechanProgram.programId);

    console.log("pda", pda.toBase58());

    const targetConfigInstruction = await input.client.memechanProgram.methods
      .newTargetConfig(input.targetAmount)
      .accounts({
        mint: input.mint,
        sender: input.payer.publicKey,
        targetConfig: pda,
        systemProgram: SystemProgram.programId,
      })
      .instruction();

    const transaction = new Transaction();
    transaction.add(targetConfigInstruction);

    const createTargetConfigMethod = getSendAndConfirmTransactionMethod({
      connection: input.client.connection,
      signers: [input.payer],
      transaction,
    });

    await createTargetConfigMethod();

    return new TargetConfigClientV2(pda, input.client, input.mint, input.targetAmount);
  }

  public static findTargetConfigPda(memeMintPubkey: PublicKey, memechanProgramId: PublicKey): PublicKey {
    return PublicKey.findProgramAddressSync([Buffer.from("config"), memeMintPubkey.toBytes()], memechanProgramId)[0];
  }

  public async changeTargetConfig(targetAmount: BN, payer: Keypair): Promise<string> {
    const tx = new Transaction();
    const result = await this.client.memechanProgram.methods
      .changeTargetConfig(targetAmount)
      .accounts({
        sender: payer.publicKey,
        targetConfig: this.id,
      })
      .instruction();

    tx.add(result);

    const addPriorityFee = ComputeBudgetProgram.setComputeUnitPrice({
      microLamports: COMPUTE_UNIT_PRICE,
    });
    tx.add(addPriorityFee);

    const signature = await sendAndConfirmTransaction(this.client.connection, tx, [payer]);
    console.log("changeTargetConfig result", result);

    return signature;
  }
}