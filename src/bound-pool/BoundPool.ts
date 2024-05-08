import {
  closeAccount,
  createAccount,
  createMint,
  createWrappedNativeAccount,
  getOrCreateAssociatedTokenAccount,
  mintTo,
  NATIVE_MINT,
  TOKEN_PROGRAM_ID,
} from "@solana/spl-token";
import { PublicKey, Keypair, Signer, SystemProgram } from "@solana/web3.js";

import { BoundPoolArgs, GoLiveArgs, SwapXArgs, SwapYArgs } from "./types";
import { BN, Program, Provider } from "@coral-xyz/anchor";
import { MemechanSol } from "../common/types/memechan_sol";
import { MemeTicket } from "../memeticket/MemeTicket";
import { AmmPool } from "../amm-pool/AmmPool";
import { StakingPool } from "../staking-pool/StakingPool";
import { SolanaContext } from "../common/types";
import { sleep } from "../common/helpers";
import { createProgramToll, findProgramTollAddress } from "../amm-pool/ammHelpers";

export class BoundPool {
  private constructor(
    public id: PublicKey,
    public admin: Keypair,
    public solVault: PublicKey,
    public solanaContext: SolanaContext,
  ) {
    //
  }

  public static findSignerPda(publicKey: PublicKey, memechanProgram: Program<MemechanSol>): PublicKey {
    return PublicKey.findProgramAddressSync([Buffer.from("signer"), publicKey.toBytes()], memechanProgram.programId)[0];
  }

  public static async new(args: BoundPoolArgs): Promise<BoundPool> {
    const id = Keypair.generate();

    const poolSigner = BoundPool.findSignerPda(id.publicKey, args.solanaContext.memechanProgram);

    const { admin, payer, signer, solanaContext } = args;
    const { connection, memechanProgram } = solanaContext;

    const memeMint = await createMint(connection, payer, poolSigner, null, 6);

    const adminSolVault = (await getOrCreateAssociatedTokenAccount(connection, payer, NATIVE_MINT, admin)).address;

    const poolSolVaultid = Keypair.generate();
    const poolSolVault = await createAccount(connection, payer, NATIVE_MINT, poolSigner, poolSolVaultid);

    const launchVaultid = Keypair.generate();
    const launchVault = await createAccount(connection, payer, memeMint, poolSigner, launchVaultid);

    await memechanProgram.methods
      .new()
      .accounts({
        adminSolVault: adminSolVault,
        launchVault: launchVault,
        solVault: poolSolVault,
        memeMint: memeMint,
        pool: id.publicKey,
        poolSigner: poolSigner,
        sender: signer.publicKey,
        solMint: NATIVE_MINT,
        tokenProgram: TOKEN_PROGRAM_ID,
        systemProgram: SystemProgram.programId,
      })
      .signers([signer, id])
      .rpc();

    return new BoundPool(id.publicKey, signer, poolSolVault, solanaContext);
  }

  public async fetch() {
    return this.solanaContext.memechanProgram.account.boundPool.fetch(this.id);
  }

  public findSignerPda(): PublicKey {
    return BoundPool.findSignerPda(this.id, this.solanaContext.memechanProgram);
  }

  public static async airdropLiquidityTokens(
    mint: PublicKey,
    wallet: PublicKey,
    authority: Signer,
    provider: Provider,
    payer: Signer,
    amount: number = 1_000_000,
  ) {
    return mintTo(provider.connection, payer, mint, wallet, authority, amount);
  }

  public async swapY(
    input: Partial<SwapYArgs>,
    provider: Provider,
    payer: Signer,
    memechanProgram: Program<MemechanSol>,
  ): Promise<MemeTicket> {
    const id = Keypair.generate();

    const pool = input.pool ?? this.id;
    const poolSignerPda = input.poolSignerPda ?? this.findSignerPda();
    const sol_in = input.solAmountIn ?? 1 * 1e9;
    const meme_out = input.memeTokensOut ?? 1;

    const userSolAcc =
      input.userSolAcc ??
      (await createWrappedNativeAccount(provider.connection, payer, input.user!.publicKey, 500 * 10e9));

    await memechanProgram.methods
      .swapY(new BN(sol_in), new BN(meme_out))
      .accounts({
        memeTicket: id.publicKey,
        owner: input.user!.publicKey,
        pool: pool,
        poolSignerPda: poolSignerPda,
        solVault: this.solVault,
        userSol: userSolAcc,
        systemProgram: SystemProgram.programId,
        tokenProgram: TOKEN_PROGRAM_ID,
      })
      .signers([input.user!, id])
      .rpc();

    return new MemeTicket(id.publicKey, this.solanaContext);
  }

  public async swapX(input: Partial<SwapXArgs>): Promise<void> {
    const user = input.user;

    const pool = input.pool ?? this.id;
    const poolSigner = input.poolSignerPda ?? this.findSignerPda();
    const meme_in = input.memeAmountIn ?? 9e6 * 1e6;
    const sol_out = input.solTokensOut ?? 1;

    const memeTicket = input.userMemeTicket;
    const userSolAcc = input.userSolAcc;

    await this.solanaContext.memechanProgram.methods
      .swapX(new BN(meme_in), new BN(sol_out))
      .accounts({
        memeTicket: memeTicket?.id,
        owner: user?.publicKey,
        pool: pool,
        poolSigner,
        solVault: this.solVault,
        userSol: userSolAcc,
        tokenProgram: TOKEN_PROGRAM_ID,
      })
      .signers([user!])
      .rpc();
  }

  public async goLive(input: Partial<GoLiveArgs>): Promise<[AmmPool, StakingPool]> {
    const ammId = Keypair.generate();

    const pool = input.pool ?? this.id;
    const poolSigner = input.poolSignerPda ?? this.findSignerPda();
    const ammPoolSigner = AmmPool.findSignerPda(ammId.publicKey, this.solanaContext.ammProgram.programId);

    const adminTicketId = Keypair.generate();

    const stakingId = Keypair.generate();
    const stakingSigner = StakingPool.findSignerPda(
      stakingId.publicKey,
      this.solanaContext.memechanProgram.programId,
    );

    const poolInfo = await this.solanaContext.memechanProgram.account.boundPool.fetch(pool);

    const user = input.user!;
    const payer = input.payer!;
    const lpMint = await createMint(this.solanaContext.connection, user, ammPoolSigner, null, 9);

    const lpTokenWalletId = Keypair.generate();
    const lpTokenWallet = await createAccount(this.solanaContext.connection, user, lpMint, poolSigner, lpTokenWalletId);

    let tollAuthority = stakingSigner;

    const toll = findProgramTollAddress(tollAuthority, this.solanaContext.ammProgram.programId);
    try {
      const info = await this.solanaContext.ammProgram.account.programToll.fetch(toll);
      tollAuthority = info.authority;
    } catch {
      await createProgramToll(tollAuthority, payer, this.solanaContext);
    }

    const aldrinProgramTollWalletId = Keypair.generate();
    const aldrinProgramTollWallet = await createAccount(
      this.solanaContext.connection,
      payer,
      lpMint,
      tollAuthority,
      aldrinProgramTollWalletId,
    );

    const stakingMemeVaultId = Keypair.generate();
    await createAccount(this.solanaContext.connection, payer, poolInfo.memeMint, stakingSigner, stakingMemeVaultId);

    const nkey = Keypair.generate();
    const userSolAcc = await createWrappedNativeAccount(
      this.solanaContext.connection,
      payer,
      user.publicKey,
      1e9,
      nkey,
    );

    await closeAccount(this.solanaContext.connection, payer, userSolAcc, stakingSigner, user);

    await sleep(1000);

    const vaults = await Promise.all(
      [poolInfo.memeMint, poolInfo.solReserve.mint].map(async (mint) => {
        const kp = Keypair.generate();
        await createAccount(this.solanaContext.connection, payer, mint, ammPoolSigner, kp);
        return {
          isSigner: false,
          isWritable: true,
          pubkey: kp.publicKey,
        };
      }),
    );

    await this.solanaContext.memechanProgram.methods
      .goLive()
      .accounts({
        pool: pool,
        signer: user.publicKey,
        adminVaultSol: poolInfo.adminVaultSol,
        boundPoolSignerPda: poolSigner,
        lpTokenWallet,
        launchTokenVault: poolInfo.launchTokenVault,
        memeMint: poolInfo.memeMint,
        memeTicket: adminTicketId.publicKey,
        solMint: NATIVE_MINT,
        poolWsolVault: poolInfo.solReserve.vault,
        staking: stakingId.publicKey,
        stakingPoolSignerPda: stakingSigner,
        aldrinLpMint: lpMint,
        aldrinPoolAcc: ammId.publicKey,
        aldrinPoolSigner: ammPoolSigner,
        aldrinProgramToll: toll,
        aldrinProgramTollWallet,
        aldrinAmmProgram: this.solanaContext.ammProgram.programId,
        systemProgram: SystemProgram.programId,
        tokenProgram: TOKEN_PROGRAM_ID,
      })
      .remainingAccounts(vaults)
      .signers([user, ammId, adminTicketId, stakingId])
      .rpc();

    return [
      new AmmPool(ammId.publicKey, tollAuthority, this.solanaContext),
      new StakingPool(stakingId.publicKey, this.solanaContext),
    ];
  }
}
