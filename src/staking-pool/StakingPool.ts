import { NATIVE_MINT, TOKEN_PROGRAM_ID, createAccount } from "@solana/spl-token";
import { PublicKey, Keypair, AccountMeta } from "@solana/web3.js";
import { UnstakeArgs, WithdrawFeesArgs } from "./types";
import { MemechanClient } from "../MemechanClient";
import { MemechanSol } from "../schema/types/memechan_sol";
import { Program } from "@coral-xyz/anchor";

export class StakingPool {
  constructor(
    public id: PublicKey,
    private client: MemechanClient,
  ) {}

  public static findSignerPda(publicKey: PublicKey, memechanProgramId: PublicKey): PublicKey {
    return PublicKey.findProgramAddressSync([Buffer.from("staking"), publicKey.toBytes()], memechanProgramId)[0];
  }

  public async addFees(ammPool: undefined, payer: Keypair) {
    const stakingInfo = await this.fetch();
    //const ammInfo = await ammPool.fetch();

    await this.client.memechanProgram.methods
      .addFees()
      .accounts({
        memeVault: stakingInfo.memeVault,
        wsolVault: stakingInfo.wsolVault,
        staking: this.id,
        stakingSignerPda: this.findSignerPda(),
        tokenProgram: TOKEN_PROGRAM_ID,
      })
      .signers([payer])
      .rpc();
  }

  public async unstake(args: UnstakeArgs): Promise<[PublicKey, PublicKey]> {
    const stakingInfo = await this.fetch();

    const memeAcc = await createAccount(
      this.client.connection,
      args.user,
      stakingInfo.memeMint,
      args.user.publicKey,
      Keypair.generate(),
    );

    const wsolAcc = await createAccount(
      this.client.connection,
      args.user,
      NATIVE_MINT,
      args.user.publicKey,
      Keypair.generate(),
    );

    await this.client.memechanProgram.methods
      .unstake(args.amount)
      .accounts({
        memeTicket: args.ticket.id,
        signer: args.user.publicKey,
        stakingSignerPda: this.findSignerPda(),
        memeVault: stakingInfo.memeVault,
        wsolVault: stakingInfo.wsolVault,
        staking: this.id,
        userMeme: memeAcc,
        userWsol: wsolAcc,
        tokenProgram: TOKEN_PROGRAM_ID,
      })
      .signers([args.user])
      .rpc();

    return [memeAcc, wsolAcc];
  }

  public async withdrawFees(args: WithdrawFeesArgs): Promise<[PublicKey, PublicKey]> {
    const stakingInfo = await this.fetch();

    const memeAcc = await createAccount(
      this.client.connection,
      args.user,
      stakingInfo.memeMint,
      args.user.publicKey,
      Keypair.generate(),
    );

    const wsolAcc = await createAccount(
      this.client.connection,
      args.user,
      NATIVE_MINT,
      args.user.publicKey,
      Keypair.generate(),
    );

    await this.client.memechanProgram.methods
      .withdrawFees()
      .accounts({
        memeTicket: args.ticket.id,
        stakingSignerPda: this.findSignerPda(),
        memeVault: stakingInfo.memeVault,
        wsolVault: stakingInfo.wsolVault,
        staking: this.id,
        userMeme: memeAcc,
        userWsol: wsolAcc,
        signer: args.user.publicKey,
        tokenProgram: TOKEN_PROGRAM_ID,
      })
      .signers([args.user])
      .rpc();

    return [memeAcc, wsolAcc];
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
