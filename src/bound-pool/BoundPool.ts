import {
  createAccount,
  createMint,
  getOrCreateAssociatedTokenAccount,
  mintTo,
  NATIVE_MINT,
  TOKEN_PROGRAM_ID,
} from "@solana/spl-token";
import { PublicKey, Keypair, Signer, SystemProgram, SYSVAR_CLOCK_PUBKEY, SYSVAR_RENT_PUBKEY } from "@solana/web3.js";
import {
  Token,
} from '@raydium-io/raydium-sdk';

import { BoundPoolArgs, GoLiveArgs, SwapXArgs, SwapYArgs } from "./types";
import { BN, Provider } from "@coral-xyz/anchor";
import { MemeTicket } from "../memeticket/MemeTicket";
import { StakingPool } from "../staking-pool/StakingPool";
import { sleep } from "../common/helpers";
import { MemechanClient } from "../MemechanClient";
import { getATAAddress, getWalletTokenAccount } from "../utils/util";
import { ammCreatePool }  from "../raydium/ammCreatePool";
import { PROGRAMIDS } from "../raydium/config";
import { formatAmmKeysById } from "../raydium/formatAmmKeysById";
import { createMarket } from "../raydium/openBookCreateMarket";

export class BoundPool {
  private constructor(
    public id: PublicKey,
    public admin: Keypair,
    public solVault: PublicKey,
    public client: MemechanClient,
  ) {
    //
  }

  public static findSignerPda(publicKey: PublicKey, memechanProgramId: PublicKey): PublicKey {
    return PublicKey.findProgramAddressSync([Buffer.from("signer"), publicKey.toBytes()], memechanProgramId)[0];
  }

  public static async new(args: BoundPoolArgs): Promise<BoundPool> {
    const id = Keypair.generate();

    const poolSigner = BoundPool.findSignerPda(id.publicKey, args.client.memechanProgram.programId);

    const { admin, payer, signer, client } = args;
    const { connection, memechanProgram } = client;

    const memeMint = await createMint(connection, payer, poolSigner, null, 6);
    const adminSolVault = (await getOrCreateAssociatedTokenAccount(connection, payer, NATIVE_MINT, admin)).address;
    const poolSolVaultid = Keypair.generate();
    const poolSolVault = await createAccount(connection, payer, NATIVE_MINT, poolSigner, poolSolVaultid);

    const launchVaultid = Keypair.generate();
    const launchVault = await createAccount(connection, payer, memeMint, poolSigner, launchVaultid);

    console.log(
      `memeMint: ${memeMint.toBase58()}, adminSolVault: ${adminSolVault.toBase58()}, poolSolVault: ${poolSolVault.toBase58()}, launchVault: ${launchVault.toBase58()}`,
    );

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

    return new BoundPool(id.publicKey, signer, poolSolVault, client);
  }

  public async fetch() {
    return this.client.memechanProgram.account.boundPool.fetch(this.id);
  }

  public findSignerPda(): PublicKey {
    return BoundPool.findSignerPda(this.id, this.client.memechanProgram.programId);
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

  public async swapY(input: Partial<SwapYArgs>): Promise<MemeTicket> {
    const id = Keypair.generate();
    const user = input.user!;
    const payer = input.payer!;

    const pool = input.pool ?? this.id;
    const poolSignerPda = BoundPool.findSignerPda(pool, this.client.memechanProgram.programId);
    const sol_in = input.solAmountIn;
    const meme_out = input.memeTokensOut;

    console.log("1");
    const userSolAcc =
      input.userSolAcc ??
      (await getOrCreateAssociatedTokenAccount(this.client.connection, payer, NATIVE_MINT, user.publicKey)).address;
    //const userSolAcc = input.userSolAcc ?? (await createWrappedNativeAccount(this.client.connection, payer, user.publicKey, input.solAmountIn));
    //const userSolAcc = input.userSolAcc ?? (await getOrCreateAssociatedTokenAccount(this.client.connection, input.payer!, NATIVE_MINT, user.publicKey)).address;

    console.log("2 userSolAcc:" + userSolAcc.toBase58());
    await this.client.memechanProgram.methods
      .swapY(new BN(sol_in), new BN(meme_out))
      .accounts({
        memeTicket: id.publicKey,
        owner: user.publicKey,
        pool: pool,
        poolSignerPda: poolSignerPda,
        solVault: this.solVault,
        userSol: userSolAcc,
        systemProgram: SystemProgram.programId,
        tokenProgram: TOKEN_PROGRAM_ID,
      })
      .signers([user, id])
      .rpc()
      .catch((e) => console.error(e));

    console.log("3");

    return new MemeTicket(id.publicKey, this.client);
  }

  public async swapX(input: Partial<SwapXArgs>): Promise<void> {
    const user = input.user;

    const pool = input.pool ?? this.id;
    const poolSigner = input.poolSignerPda ?? this.findSignerPda();
    const meme_in = input.memeAmountIn;
    const sol_out = input.solTokensOut;

    const memeTicket = input.userMemeTicket;
    const userSolAcc = input.userSolAcc;

    await this.client.memechanProgram.methods
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

  public async goLive(input: Partial<GoLiveArgs>): Promise<[ StakingPool]> {
    const user = input.user!;
    const pool = input.pool ?? this.id;
    const boundPoolInfo = await this.client.memechanProgram.account.boundPool.fetch(pool);

    const baseTokenInfo = { mint: boundPoolInfo.memeMint, decimals: 6 };
    const quoteTokenInfo = Token.WSOL;

    const memeATA = await getOrCreateAssociatedTokenAccount(this.client.connection, user, baseTokenInfo.mint, user.publicKey);

    const { marketId } = await createMarket({
      baseToken: baseTokenInfo,
      quoteToken: quoteTokenInfo,
      wallet: user,
      connection: this.client.connection,
    })

    sleep(1000);

    //const marketId = new PublicKey("HSaBUhTu2LiepqVVCKoATZoFhehhVHN7b7TJx3bxUKq6");

    const addBaseAmount = boundPoolInfo.memeAmt; //new BN(10000) // 10000 / 10 ** 6,
    const addQuoteAmount = new BN(10000) // 10000 / 10 ** 6,
    const startTime = Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 1 // start from 1 days later
    const walletTokenAccounts = await getWalletTokenAccount(this.client.connection, user.publicKey);

    console.log("walletTokenAccounts", walletTokenAccounts);

  // /* do something with start price if needed */
  // const startPrice = calcMarketStartPrice({ addBaseAmount, addQuoteAmount })

  // /* do something with market associated pool keys if needed */
  // const associatedPoolKeys = getMarketAssociatedPoolKeys({
  //   baseToken,
  //   quoteToken,
  //   targetMarketId,
  // })

    console.log("marketId", marketId.toBase58());

  const { ammPool, poolInfo }  = await ammCreatePool({
      startTime,
      addBaseAmount,
      addQuoteAmount,
      baseToken: baseTokenInfo,
      quoteToken: quoteTokenInfo,
      targetMarketId: marketId,
      wallet: user,
      walletTokenAccounts,
      connection: this.client.connection,
    });

    console.log("ammPool: " + JSON.stringify(ammPool));
    console.log("poolInfo: " + JSON.stringify(poolInfo));
    sleep(1000);

    const poolInfo2 = await formatAmmKeysById(ammPool.ammId, this.client.connection);
    console.log("poolInfo2: " + JSON.stringify(poolInfo2));


    console.log("poolInfo: " + poolInfo);

    console.log("ammId prev: " + ammPool.ammId);

    const ammId = new PublicKey(ammPool.ammId);

    console.log("ammId: " + poolInfo);

    const boundPoolSigner = BoundPool.findSignerPda(pool, this.client.memechanProgram.programId);
    const adminTicketId = Keypair.generate();

    const stakingId = Keypair.generate();
    const stakingSigner = StakingPool.findSignerPda(stakingId.publicKey, this.client.memechanProgram.programId);

    const feeDestination = new PublicKey(process.env.FEE_DESTINATION_ID as string);

    const payer = input.payer!;
    //const lpMint = await createMint(this.client.connection, user, ammPoolSigner, null, 9);

    //console.log("lpMint", lpMint.toBase58());

    //const lpTokenWalletId = Keypair.generate();
    //const lpTokenWallet = await createAccount(this.client.connection, user, lpMint, poolSigner, lpTokenWalletId);

    //let tollAuthority = stakingSigner;

    // const toll = findProgramTollAddress(tollAuthority, this.client.ammProgram.programId);
    // try {
    //   const info = await this.client.ammProgram.account.programToll.fetch(toll);
    //   tollAuthority = info.authority;
    // } catch {
    //   await createProgramToll(tollAuthority, payer, this.client);
    // }

    // const aldrinProgramTollWalletId = Keypair.generate();
    // const aldrinProgramTollWallet = await createAccount(
    //   this.client.connection,
    //   payer,
    //   lpMint,
    //   tollAuthority,
    //   aldrinProgramTollWalletId,
    // );

    // const stakingMemeVaultId = Keypair.generate();
    // await createAccount(this.client.connection, payer, boundPoolInfo.memeMint, stakingSigner, stakingMemeVaultId);

    // const nkey = Keypair.generate();
    // const userSolAcc = await createWrappedNativeAccount(this.client.connection, payer, user.publicKey, 1e9, nkey);

    // await closeAccount(this.client.connection, payer, userSolAcc, stakingSigner, user);

    // await sleep(1000);

    const vaults = await Promise.all(
      [boundPoolInfo.memeMint, boundPoolInfo.solReserve.mint].map(async (mint) => {
        const kp = Keypair.generate();
        await createAccount(this.client.connection, payer, mint, user.publicKey, kp); // ??? user.publicKey
        return {
          isSigner: false,
          isWritable: true,
          pubkey: kp.publicKey,
        };
      }),
    );

    const userDestinationLpTokenAta = getATAAddress(TOKEN_PROGRAM_ID, user.publicKey, ammPool.lpMint).publicKey; // ??
    const nonce = 0;

    await this.client.memechanProgram.methods
      .goLive(nonce)
      .accounts(
        {
        pool: pool,
        signer: user.publicKey,
        adminVaultSol: boundPoolInfo.adminVaultSol,
        boundPoolSignerPda: boundPoolSigner,
        poolMemeVault: boundPoolInfo.poolMemeVault,
        memeMint: boundPoolInfo.memeMint,
        memeTicket: adminTicketId.publicKey,
        solMint: NATIVE_MINT,
        poolWsolVault: boundPoolInfo.solReserve.vault,
        staking: stakingId.publicKey,
        stakingPoolSignerPda: stakingSigner,
        
        raydiumLpMint: ammPool.lpMint,
        raydiumAmm: ammId,
        raydiumAmmAuthority: ammPool.ammAuthority,
        raydiumMemeVault: ammPool.coinVault,
        raydiumWsolVault: ammPool.pcVault,
        ammConfig: poolInfo.configId,
        feeDestination: feeDestination,
        ataProgram: PROGRAMIDS.ATA_PROGRAM_ID,
        marketProgramId: PROGRAMIDS.OPENBOOK_MARKET,
        systemProgram: SystemProgram.programId,
        tokenProgram: TOKEN_PROGRAM_ID,
        userDestinationLpTokenAta, // ??
        marketAccount: marketId,
        clock: SYSVAR_CLOCK_PUBKEY,
        rent: SYSVAR_RENT_PUBKEY,
        poolLpWallet: memeATA.address,
        marketEventQueue: poolInfo.marketEventQueue,
        openOrders: poolInfo.openOrders,
        targetOrders: poolInfo.targetOrders
      })
      .remainingAccounts(vaults)
      .signers([user, adminTicketId, stakingId]) // ammid?
      .rpc();

    return [
      //new AmmPool(ammId.publicKey, tollAuthority, this.client),
      new StakingPool(stakingId.publicKey, this.client),
    ];
  }
}

