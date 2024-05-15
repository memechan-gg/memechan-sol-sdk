import {
  createAccount,
  createMint,
  createSyncNativeInstruction,
  createWrappedNativeAccount,
  getAccount,
  getOrCreateAssociatedTokenAccount,
  mintTo,
  NATIVE_MINT,
  TOKEN_PROGRAM_ID,
} from "@solana/spl-token";
import {
  PublicKey,
  Keypair,
  Signer,
  SystemProgram,
  SYSVAR_CLOCK_PUBKEY,
  SYSVAR_RENT_PUBKEY,
  Transaction,
  sendAndConfirmTransaction,
  LAMPORTS_PER_SOL,
} from "@solana/web3.js";
import { Token } from "@raydium-io/raydium-sdk";

import { BoundPoolArgs, GoLiveArgs, InitStakingPoolArgs, SwapXArgs, SwapYArgs } from "./types";
import { BN, Provider } from "@coral-xyz/anchor";
import { MemeTicket } from "../memeticket/MemeTicket";
import { StakingPool } from "../staking-pool/StakingPool";
import { MemechanClient } from "../MemechanClient";
import { getATAAddress, getWalletTokenAccount } from "../utils/util";
import { ammCreatePool } from "../raydium/ammCreatePool";
import { ATA_PROGRAM_ID, PROGRAMIDS } from "../raydium/config";
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

  public static findBoundPoolPda(
    memeMintPubkey: PublicKey,
    solMintPubkey: PublicKey,
    memechanProgramId: PublicKey,
  ): PublicKey {
    return PublicKey.findProgramAddressSync(
      [Buffer.from("bound_pool"), memeMintPubkey.toBytes(), solMintPubkey.toBytes()],
      memechanProgramId,
    )[0];
  }

  public static findStakingPda(memeMintPubkey: PublicKey, memechanProgramId: PublicKey): PublicKey {
    return PublicKey.findProgramAddressSync(
      [Buffer.from("staking_pool"), memeMintPubkey.toBytes()],
      memechanProgramId,
    )[0];
  }

  public static findMemeTicketPda(stakingPubKey: PublicKey, memechanProgramId: PublicKey): PublicKey {
    return PublicKey.findProgramAddressSync(
      [Buffer.from("admin_ticket"), stakingPubKey.toBytes()],
      memechanProgramId,
    )[0];
  }

  public static async new(args: BoundPoolArgs): Promise<BoundPool> {
    const { admin, payer, signer, client } = args;
    const { connection, memechanProgram } = client;

    const memeMintKeypair = Keypair.generate();
    const id = this.findBoundPoolPda(memeMintKeypair.publicKey, NATIVE_MINT, args.client.memechanProgram.programId);
    const poolSigner = BoundPool.findSignerPda(id, args.client.memechanProgram.programId);

    const memeMint = await createMint(connection, payer, poolSigner, null, 6, memeMintKeypair);

    const adminSolVault = (await getOrCreateAssociatedTokenAccount(connection, payer, NATIVE_MINT, admin)).address;
    const poolSolVaultid = Keypair.generate();
    const poolSolVault = await createAccount(connection, payer, NATIVE_MINT, poolSigner, poolSolVaultid);

    const launchVaultid = Keypair.generate();
    const launchVault = await createAccount(connection, payer, memeMint, poolSigner, launchVaultid);

    console.log(
      `memeMint: ${memeMint.toBase58()}, adminSolVault: ${adminSolVault.toBase58()}, poolSolVault: ${poolSolVault.toBase58()}, launchVault: ${launchVault.toBase58()}`,
    );

    const result = await memechanProgram.methods
      .new()
      .accounts({
        adminSolVault: adminSolVault,
        launchVault: launchVault,
        solVault: poolSolVault,
        memeMint: memeMint,
        pool: id,
        poolSigner: poolSigner,
        sender: signer.publicKey,
        solMint: NATIVE_MINT,
        tokenProgram: TOKEN_PROGRAM_ID,
        systemProgram: SystemProgram.programId,
      })
      .signers([signer])
      .rpc();

    console.log("new pool tx result: " + result);

    return new BoundPool(id, signer, poolSolVault, client);
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

    console.log("2 userSolAcc:" + userSolAcc.toBase58());
    console.log("payer.publicKey: " + payer.publicKey.toBase58());
    console.log("user.publicKey: " + user.publicKey.toBase58());
    console.log("sol_in: " + sol_in);

    console.log("this.client.connection.rpc " + this.client.connection.rpcEndpoint);
    const balance = await this.client.connection.getBalance(payer.publicKey);
    console.log(`${balance / LAMPORTS_PER_SOL} SOL`);

    const transferTx = new Transaction().add(
      SystemProgram.transfer({
        fromPubkey: payer.publicKey,
        toPubkey: userSolAcc,
        lamports: sol_in,
      }),
      createSyncNativeInstruction(userSolAcc),
    );

    const transferResult = await sendAndConfirmTransaction(this.client.connection, transferTx, [payer], { skipPreflight: true });

    console.log("3 transferResult: " + transferResult);

    const accountInfo = await getAccount(this.client.connection, userSolAcc);
    console.log(`Native: ${accountInfo.isNative}, Lamports: ${accountInfo.amount}`);

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
      .rpc({ skipPreflight: true, maxRetries: 3 })
      .catch((e) => console.error(e));

    console.log("4");

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

  public async initStakingPool(input: Partial<InitStakingPoolArgs>): Promise<string> {
    const user = input.user!;
    const pool = input.pool ?? this.id;

    const boundPoolInfo = await this.fetch();

    const stakingId = BoundPool.findStakingPda(boundPoolInfo.memeReserve.mint, this.client.memechanProgram.programId);
    const stakingSigner = StakingPool.findSignerPda(stakingId, this.client.memechanProgram.programId);

    const adminTicketId = BoundPool.findMemeTicketPda(stakingId, this.client.memechanProgram.programId);

    //const feeDestination = new PublicKey(process.env.FEE_DESTINATION_ID as string);

    //const userDestinationLpTokenAta = getATAAddress(TOKEN_PROGRAM_ID, user.publicKey, boundPoolInfo.lpMint).publicKey;

    const result = await this.client.memechanProgram.methods
      .initStakingPool()
      .accounts({
        pool: pool,
        signer: user.publicKey,
        boundPoolSignerPda: this.findSignerPda(),
        memeTicket: adminTicketId,
        poolMemeVault: boundPoolInfo.memeReserve.vault,
        poolWsolVault: boundPoolInfo.solReserve.vault,
        solMint: NATIVE_MINT,
        staking: stakingId,
        stakingPoolSignerPda: stakingSigner,
        adminVaultSol: boundPoolInfo.adminVaultSol,
        marketProgramId: PROGRAMIDS.OPENBOOK_MARKET,
        systemProgram: SystemProgram.programId,
        tokenProgram: TOKEN_PROGRAM_ID,
        clock: SYSVAR_CLOCK_PUBKEY,
        rent: SYSVAR_RENT_PUBKEY,
        memeMint: boundPoolInfo.memeReserve.mint,
        ataProgram: ATA_PROGRAM_ID,
      })
      .signers([user])
      .rpc({ skipPreflight: true });

    console.log("initStakingPool tx result: " + result);

    return result;
  }

  public async goLive(input: Partial<GoLiveArgs>): Promise<[StakingPool]> {
    const user = input.user!;
    // const pool = input.pool ?? this.id;

    // tmp new test token
    const testTokenMint = await createMint(this.client.connection, user, user.publicKey, null, 6);
    const testTokenATA = await getOrCreateAssociatedTokenAccount(
      this.client.connection,
      user,
      testTokenMint,
      user.publicKey,
    );
    await mintTo(this.client.connection, user, testTokenMint, testTokenATA.address, user, 1000000000);

    //const baseTokenInfo = { mint: boundPoolInfo.memeMint, decimals: 6 };
    const baseTokenInfo = { mint: testTokenMint, decimals: 6 };
    const quoteTokenInfo = Token.WSOL;

    const { txids: createMarketTxIds, marketId } = await createMarket({
      baseToken: baseTokenInfo,
      quoteToken: quoteTokenInfo,
      wallet: user,
      connection: this.client.connection,
    });

    console.log("createMarketTxIds: " + JSON.stringify(createMarketTxIds));

    const createMarkeLatestBH0 = await this.client.connection.getLatestBlockhash("confirmed");
    const createMarketTxResult = await this.client.connection.confirmTransaction(
      {
        signature: createMarketTxIds[0],
        blockhash: createMarkeLatestBH0.blockhash,
        lastValidBlockHeight: createMarkeLatestBH0.lastValidBlockHeight,
      },
      "confirmed",
    );

    if (createMarketTxResult.value.err) {
      console.error("createMarketTxResult", createMarketTxResult);
      throw new Error("createMarketTxResult failed");
    }

    // const boundPoolSigner = BoundPool.findSignerPda(pool, this.client.memechanProgram.programId);

    // how to mint
    //await mintTo(this.client.connection, user, baseTokenInfo.mint, memeATA.address, boundPoolSigner, 100000);

    const addBaseAmount = new BN(10000000); //new BN(10000) // 10000 / 10 ** 6,
    const addQuoteAmount = new BN(10000000); // 10000 / 10 ** 6,
    const startTime = Math.floor(Date.now() / 1000) + 60; // start from 1 minute later
    const walletTokenAccounts = await getWalletTokenAccount(this.client.connection, user.publicKey);

    console.log("marketId", marketId.toBase58());

    const {
      txids: ammCreatePoolTxIds,
      ammPool,
      poolInfo,
    } = await ammCreatePool({
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

    console.log("ammCreatePoolTxIds: " + JSON.stringify(ammCreatePoolTxIds));

    const latestBH = await this.client.connection.getLatestBlockhash("confirmed");
    const ammCreatePoolTxResult = await this.client.connection.confirmTransaction(
      {
        signature: ammCreatePoolTxIds[0],
        blockhash: latestBH.blockhash,
        lastValidBlockHeight: latestBH.lastValidBlockHeight,
      },
      "confirmed",
    );

    if (ammCreatePoolTxResult.value.err) {
      console.error("ammCreatePoolTxResult", ammCreatePoolTxResult);
      throw new Error("ammCreatePoolTxResult failed");
    }

    console.log("ammPool: " + JSON.stringify(ammPool));
    console.log("poolInfo: " + JSON.stringify(poolInfo));

    const poolInfo2 = await formatAmmKeysById(ammPool.ammId.toBase58(), this.client.connection);
    console.log("poolInfo2: " + JSON.stringify(poolInfo2));

    const ammId = new PublicKey(ammPool.ammId);

    const boundPoolInfo = await this.fetch();

    // const adminTicketId = Keypair.generate();
    const stakingId = BoundPool.findStakingPda(boundPoolInfo.memeReserve.mint, this.client.memechanProgram.programId);
    const stakingSigner = StakingPool.findSignerPda(stakingId, this.client.memechanProgram.programId);

    const feeDestination = new PublicKey(process.env.FEE_DESTINATION_ID as string);

    const userDestinationLpTokenAta = getATAAddress(TOKEN_PROGRAM_ID, user.publicKey, ammPool.lpMint).publicKey; // ??
    const nonce = 0; // ??

    const result = await this.client.memechanProgram.methods
      .goLive(nonce)
      .accounts({
        signer: user.publicKey,
        poolMemeVault: ammPool.coinVault,
        poolWsolVault: ammPool.pcVault,
        solMint: NATIVE_MINT,
        staking: stakingId,
        stakingPoolSignerPda: stakingSigner,
        raydiumLpMint: ammPool.lpMint,
        raydiumAmm: ammId,
        raydiumAmmAuthority: ammPool.ammAuthority,
        raydiumMemeVault: ammPool.coinVault,
        raydiumWsolVault: ammPool.pcVault,
        marketProgramId: PROGRAMIDS.OPENBOOK_MARKET,
        systemProgram: SystemProgram.programId,
        tokenProgram: TOKEN_PROGRAM_ID,
        marketAccount: marketId,
        clock: SYSVAR_CLOCK_PUBKEY,
        rent: SYSVAR_RENT_PUBKEY,
        openOrders: poolInfo2.openOrders,
        targetOrders: poolInfo2.targetOrders,
        memeMint: boundPoolInfo.memeReserve.mint,
        ammConfig: poolInfo2.ammConfig,
        ataProgram: ATA_PROGRAM_ID,
        feeDestinationInfo: feeDestination,
        userDestinationLpTokenAta: userDestinationLpTokenAta,
      })
      .signers([user]) // ammid?
      .rpc({ skipPreflight: true });

    console.log("goLive tx result: " + result);

    return [
      //new AmmPool(ammId.publicKey, tollAuthority, this.client),
      new StakingPool(stakingId, this.client),
    ];
  }
}
