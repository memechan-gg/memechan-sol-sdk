import { NATIVE_MINT, TOKEN_PROGRAM_ID, createAccount } from "@solana/spl-token";
import { PublicKey, Keypair, AccountMeta } from "@solana/web3.js";
import { AmmPool } from "../amm-pool/AmmPool";
import { UnstakeArgs, WithdrawFeesArgs } from "./types";
import { SolanaContext } from "../common/types";

export class StakingPool {
  constructor(
    public id: PublicKey,
    private solanaContext: SolanaContext,
  ) {}

  public static findSignerPda(publicKey: PublicKey, memechanProgramId: PublicKey): PublicKey {
    return PublicKey.findProgramAddressSync([Buffer.from("staking"), publicKey.toBytes()], memechanProgramId)[0];
  }

  public async addFees(ammPool: AmmPool, payer: Keypair) {
    const stakingInfo = await this.fetchStakingPool();
    const ammInfo = await ammPool.fetch();

    await this.solanaContext.memechanProgram.methods
      .addFees()
      .accounts({
        memeVault: stakingInfo.memeVault,
        wsolVault: stakingInfo.wsolVault,
        staking: this.id,
        aldrinPoolAcc: ammPool.id,
        aldrinAmmProgram: this.solanaContext.ammProgram.programId,
        aldrinLpMint: ammInfo.mint,
        aldrinPoolLpWallet: ammInfo.programTollWallet,
        aldrinPoolSigner: ammPool.findSignerPda(),
        stakingSignerPda: this.findSignerPda(),
        tokenProgram: TOKEN_PROGRAM_ID,
      })
      .remainingAccounts([
        this.getAccountMeta(ammInfo.reserves[0].vault),
        this.getAccountMeta(ammInfo.reserves[1].vault),
      ])
      .signers([payer])
      .rpc();
  }

  public async unstake(args: UnstakeArgs): Promise<[PublicKey, PublicKey]> {
    const stakingInfo = await this.fetchStakingPool();

    const memeAcc = await createAccount(
      this.solanaContext.connection,
      args.user,
      stakingInfo.memeMint,
      args.user.publicKey,
      Keypair.generate(),
    );

    const wsolAcc = await createAccount(
      this.solanaContext.connection,
      args.user,
      NATIVE_MINT,
      args.user.publicKey,
      Keypair.generate(),
    );

    await this.solanaContext.memechanProgram.methods
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
    const stakingInfo = await this.fetchStakingPool();

    const memeAcc = await createAccount(
      this.solanaContext.connection,
      args.user,
      stakingInfo.memeMint,
      args.user.publicKey,
      Keypair.generate(),
    );

    const wsolAcc = await createAccount(
      this.solanaContext.connection,
      args.user,
      NATIVE_MINT,
      args.user.publicKey,
      Keypair.generate(),
    );

    await this.solanaContext.memechanProgram.methods
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

  private async fetchStakingPool() {
    return this.solanaContext.memechanProgram.account.stakingPool.fetch(this.id);
  }

  public findSignerPda(): PublicKey {
    return StakingPool.findSignerPda(this.id, this.solanaContext.memechanProgram.programId);
  }

  private getAccountMeta(pubkey: PublicKey): AccountMeta {
    return { isSigner: false, isWritable: true, pubkey };
  }
}
