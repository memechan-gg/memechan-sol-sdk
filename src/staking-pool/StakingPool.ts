import { Program } from "@coral-xyz/anchor";
import { NATIVE_MINT, TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { AccountMeta, Keypair, PublicKey, Transaction } from "@solana/web3.js";
import { MemechanClient } from "../MemechanClient";
import { MemechanSol } from "../schema/types/memechan_sol";
import { getCreateAccountInstructions } from "../utils/getCreateAccountInstruction";
import { getSendAndConfirmTransactionMethod } from "../utils/getSendAndConfirmTransactionMethod";
import { retry } from "../utils/retry";
import {
  AddFeesArgs,
  GetAddFeesTransactionArgs,
  GetUnstakeTransactionArgs,
  GetWithdrawFeesTransactionArgs,
  UnstakeArgs,
  WithdrawFeesArgs,
} from "./types";

export class StakingPool {
  constructor(
    public id: PublicKey,
    private client: MemechanClient,
  ) {}

  public static findSignerPda(publicKey: PublicKey, memechanProgramId: PublicKey): PublicKey {
    return PublicKey.findProgramAddressSync([Buffer.from("staking"), publicKey.toBytes()], memechanProgramId)[0];
  }

  public async getAddFeesTransaction({ transaction }: GetAddFeesTransactionArgs): Promise<Transaction> {
    const tx = transaction ?? new Transaction();
    const stakingInfo = await this.fetch();

    const addFeesInstruction = await this.client.memechanProgram.methods
      .addFees()
      .accounts({
        memeVault: stakingInfo.memeVault,
        quoteVault: stakingInfo.quoteVault,
        staking: this.id,
        stakingSignerPda: this.findSignerPda(),
        tokenProgram: TOKEN_PROGRAM_ID,
      })
      .instruction();

    tx.add(addFeesInstruction);

    return tx;
  }

  public async addFees({ payer, transaction }: AddFeesArgs): Promise<void> {
    const addFeesTransaction = await this.getAddFeesTransaction({ transaction });

    const sendAndConfirmAddFeesTransaction = getSendAndConfirmTransactionMethod({
      connection: this.client.connection,
      signers: [payer],
      transaction: addFeesTransaction,
    });

    await retry({
      fn: sendAndConfirmAddFeesTransaction,
      functionName: "addFees",
    });
  }

  public async getUnstakeTransaction(
    args: GetUnstakeTransactionArgs,
  ): Promise<{ transaction: Transaction; memeAccountPublicKey: PublicKey; wSolAccountPublicKey: PublicKey }> {
    const tx = args.transaction ?? new Transaction();
    const stakingInfo = await this.fetch();

    const memeAccountKeypair = Keypair.generate();
    const memeAccountPublicKey = memeAccountKeypair.publicKey;
    const createMemeAccountInstructions = await getCreateAccountInstructions(
      this.client.connection,
      args.user,
      stakingInfo.memeMint,
      args.user.publicKey,
      memeAccountKeypair,
    );

    tx.add(...createMemeAccountInstructions);

    const wSolAccountKeypair = Keypair.generate();
    const wSolAccountPublicKey = wSolAccountKeypair.publicKey;
    const createWSolAccountInstructions = await getCreateAccountInstructions(
      this.client.connection,
      args.user,
      NATIVE_MINT,
      args.user.publicKey,
      wSolAccountKeypair,
    );

    tx.add(...createWSolAccountInstructions);

    const unstakeInstruction = await this.client.memechanProgram.methods
      .unstake(args.amount)
      .accounts({
        memeTicket: args.ticket.id,
        signer: args.user.publicKey,
        stakingSignerPda: this.findSignerPda(),
        memeVault: stakingInfo.memeVault,
        quoteVault: stakingInfo.quoteVault,
        staking: this.id,
        userMeme: memeAccountPublicKey,
        userQuote: wSolAccountPublicKey,
        tokenProgram: TOKEN_PROGRAM_ID,
      })
      .instruction();

    tx.add(unstakeInstruction);

    return { transaction: tx, memeAccountPublicKey, wSolAccountPublicKey };
  }

  public async unstake(
    args: UnstakeArgs,
  ): Promise<{ memeAccountPublicKey: PublicKey; wSolAccountPublicKey: PublicKey }> {
    const { memeAccountPublicKey, transaction, wSolAccountPublicKey } = await this.getUnstakeTransaction(args);

    const sendAndConfirmUnstakeTransaction = getSendAndConfirmTransactionMethod({
      connection: this.client.connection,
      signers: [args.user],
      transaction,
    });

    await retry({
      fn: sendAndConfirmUnstakeTransaction,
      functionName: "unstake",
    });

    return { memeAccountPublicKey, wSolAccountPublicKey };
  }

  public async getWithdrawFeesTransaction(args: GetWithdrawFeesTransactionArgs): Promise<{
    transaction: Transaction;
    memeAccountPublicKey: PublicKey;
    wSolAccountPublicKey: PublicKey;
  }> {
    const tx = args.transaction ?? new Transaction();
    const stakingInfo = await this.fetch();

    const memeAccountKeypair = Keypair.generate();
    const memeAccountPublicKey = memeAccountKeypair.publicKey;
    const createMemeAccountInstructions = await getCreateAccountInstructions(
      this.client.connection,
      args.user,
      stakingInfo.memeMint,
      args.user.publicKey,
      memeAccountKeypair,
    );

    tx.add(...createMemeAccountInstructions);

    const wSolAccountKeypair = Keypair.generate();
    const wSolAccountPublicKey = wSolAccountKeypair.publicKey;
    const createWSolAccountInstructions = await getCreateAccountInstructions(
      this.client.connection,
      args.user,
      NATIVE_MINT,
      args.user.publicKey,
      wSolAccountKeypair,
    );

    tx.add(...createWSolAccountInstructions);

    const withdrawFeesInstruction = await this.client.memechanProgram.methods
      .withdrawFees()
      .accounts({
        memeTicket: args.ticket.id,
        stakingSignerPda: this.findSignerPda(),
        memeVault: stakingInfo.memeVault,
        quoteVault: stakingInfo.quoteVault,
        staking: this.id,
        userMeme: memeAccountPublicKey,
        userQuote: wSolAccountPublicKey,
        signer: args.user.publicKey,
        tokenProgram: TOKEN_PROGRAM_ID,
      })
      .instruction();

    tx.add(withdrawFeesInstruction);

    return { transaction: tx, memeAccountPublicKey, wSolAccountPublicKey };
  }

  public async withdrawFees(
    args: WithdrawFeesArgs,
  ): Promise<{ memeAccountPublicKey: PublicKey; wSolAccountPublicKey: PublicKey }> {
    const { memeAccountPublicKey, transaction, wSolAccountPublicKey } = await this.getWithdrawFeesTransaction(args);

    const sendAndConfirmWithdrawFeesTransaction = getSendAndConfirmTransactionMethod({
      connection: this.client.connection,
      signers: [args.user],
      transaction,
    });

    await retry({
      fn: sendAndConfirmWithdrawFeesTransaction,
      functionName: "withdrawFees",
    });

    return { memeAccountPublicKey, wSolAccountPublicKey };
  }

  private async fetch(program = this.client.memechanProgram) {
    return program.account.stakingPool.fetch(this.id);
  }

  public static async all(program: Program<MemechanSol>) {
    return program.account.stakingPool.all();
  }

  public findSignerPda(): PublicKey {
    return StakingPool.findSignerPda(this.id, this.client.memechanProgram.programId);
  }

  private getAccountMeta(pubkey: PublicKey): AccountMeta {
    return { isSigner: false, isWritable: true, pubkey };
  }
}
