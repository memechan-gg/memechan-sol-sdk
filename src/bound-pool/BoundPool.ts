import { Token } from "@raydium-io/raydium-sdk";
import {
  ASSOCIATED_TOKEN_PROGRAM_ID,
  createAccount,
  createAssociatedTokenAccountInstruction,
  getAssociatedTokenAddressSync,
  getOrCreateAssociatedTokenAccount,
  mintTo,
  NATIVE_MINT,
  TOKEN_PROGRAM_ID,
} from "@solana/spl-token";
import {
  ComputeBudgetProgram,
  Connection,
  Keypair,
  PublicKey,
  sendAndConfirmTransaction,
  Signer,
  SystemProgram,
  SYSVAR_CLOCK_PUBKEY,
  SYSVAR_RENT_PUBKEY,
  Transaction,
} from "@solana/web3.js";
import { BoundPool as CodegenBoundPool } from "../schema/codegen/accounts";

import { AnchorError, BN, Program, Provider } from "@coral-xyz/anchor";
import { MemechanClient } from "../MemechanClient";
import { MemeTicket } from "../memeticket/MemeTicket";
import { ATA_PROGRAM_ID, PROGRAMIDS } from "../raydium/config";
import { createMarket } from "../raydium/openBookCreateMarket";
import { StakingPool } from "../staking-pool/StakingPool";
import {
  BoundPoolArgs,
  GetBuyMemeTransactionArgs,
  GetCreateNewBondingPoolAndTokenTransactionArgs,
  GetInitStakingPoolTransactionArgs,
  GetSellMemeTransactionArgs,
  GoLiveArgs,
  InitStakingPoolArgs,
  InitStakingPoolResult,
  SwapXArgs,
  SwapYArgs,
} from "./types";

import { findProgramAddress } from "../common/helpers";
import { MEMECHAN_QUOTE_TOKEN, MEMECHAN_TARGET_CONFIG } from "../config/config";
import { MemechanSol } from "../schema/types/memechan_sol";
import { createMetadata, getCreateMetadataTransaction } from "../token/createMetadata";
import { createMintWithPriority } from "../token/createMintWithPriority";
import { getCreateMintWithPriorityTransaction } from "../token/getCreateMintWithPriorityTransaction";
import { getCreateAccountInstructions } from "../utils/getCreateAccountInstruction";
import { getSendAndConfirmTransactionMethod } from "../utils/getSendAndConfirmTransactionMethod";
import { retry } from "../utils/retry";

export class BoundPool {
  private constructor(
    public id: PublicKey,
    public admin: Keypair,
    public solVault: PublicKey,
    public memeVault: PublicKey,
    public client: MemechanClient,
    public quoteToken: Token = MEMECHAN_QUOTE_TOKEN,
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

  public static async getCreateNewBondingPoolAndTokenTransaction(
    args: GetCreateNewBondingPoolAndTokenTransactionArgs,
  ): Promise<{ transaction: Transaction; memeMint: PublicKey; poolSolVault: PublicKey; launchVault: PublicKey }> {
    const {
      admin,
      payer,
      signer,
      client,
      quoteToken,
      transaction = new Transaction(),
      adminSolPublicKey,
      tokenMetadata,
    } = args;
    const { connection, memechanProgram } = client;

    const memeMintKeypair = Keypair.generate();
    const memeMint = memeMintKeypair.publicKey;
    const id = this.findBoundPoolPda(memeMintKeypair.publicKey, quoteToken.mint, args.client.memechanProgram.programId);
    const poolSigner = BoundPool.findSignerPda(id, args.client.memechanProgram.programId);

    const createMemeMintWithPriorityInstructions = (
      await getCreateMintWithPriorityTransaction(connection, payer, poolSigner, null, 6, memeMintKeypair)
    ).instructions;

    transaction.add(...createMemeMintWithPriorityInstructions);

    let adminQuoteVault;

    if (!adminSolPublicKey) {
      const associatedToken = getAssociatedTokenAddressSync(
        quoteToken.mint,
        admin,
        true,
        TOKEN_PROGRAM_ID,
        ASSOCIATED_TOKEN_PROGRAM_ID,
      );

      const associatedTransactionInstruction = createAssociatedTokenAccountInstruction(
        payer.publicKey,
        associatedToken,
        admin,
        quoteToken.mint,
        TOKEN_PROGRAM_ID,
        ASSOCIATED_TOKEN_PROGRAM_ID,
      );

      transaction.add(associatedTransactionInstruction);

      adminQuoteVault = associatedToken;
    }

    const poolSolVaultId = Keypair.generate();
    const poolSolVault = poolSolVaultId.publicKey;
    const createPoolSolVaultInstructions = await getCreateAccountInstructions(
      connection,
      payer,
      quoteToken.mint,
      poolSigner,
      poolSolVaultId,
    );

    transaction.add(...createPoolSolVaultInstructions);

    const launchVaultId = Keypair.generate();
    const launchVault = launchVaultId.publicKey;
    const createLaunchVaultInstructions = await getCreateAccountInstructions(
      connection,
      payer,
      memeMint,
      poolSigner,
      launchVaultId,
    );

    transaction.add(...createLaunchVaultInstructions);

    const createPoolInstruction = await memechanProgram.methods
      .newPool()
      .accounts({
        adminQuoteVault: adminQuoteVault,
        memeVault: launchVault,
        quoteVault: poolSolVault,
        memeMint: memeMint,
        pool: id,
        poolSigner: poolSigner,
        sender: signer.publicKey,
        quoteMint: quoteToken.mint,
        tokenProgram: TOKEN_PROGRAM_ID,
        systemProgram: SystemProgram.programId,
      })
      .instruction();

    transaction.add(createPoolInstruction);

    const createTokenInstructions = (
      await getCreateMetadataTransaction(client, {
        payer,
        mint: memeMint,
        poolSigner,
        poolId: id,
        metadata: tokenMetadata,
      })
    ).instructions;

    transaction.add(...createTokenInstructions);

    return { transaction, memeMint, poolSolVault, launchVault };
  }

  public static async new(args: BoundPoolArgs): Promise<BoundPool> {
    const { payer, signer, client, quoteToken } = args;
    const { connection, memechanProgram } = client;

    const {
      transaction: createPoolAndTokenTransaction,
      memeMint,
      poolSolVault,
      launchVault,
    } = await this.getCreateNewBondingPoolAndTokenTransaction(args);

    const signature = await sendAndConfirmTransaction(connection, createPoolAndTokenTransaction, [signer, payer], {
      commitment: "confirmed",
      skipPreflight: true,
    });
    console.log("Create new pool and token transaction signature:", signature);

    const id = this.findBoundPoolPda(memeMint, quoteToken.mint, memechanProgram.programId);

    return new BoundPool(id, signer, poolSolVault, launchVault, client, quoteToken);
  }

  public static async slowNew(args: BoundPoolArgs): Promise<BoundPool> {
    const { admin, payer, signer, client, quoteToken } = args;
    const { connection, memechanProgram } = client;

    const memeMintKeypair = Keypair.generate();
    console.log("quoteToken.mint: " + quoteToken.mint);
    const id = this.findBoundPoolPda(memeMintKeypair.publicKey, quoteToken.mint, args.client.memechanProgram.programId);
    const poolSigner = BoundPool.findSignerPda(id, args.client.memechanProgram.programId);
    console.log("poolSigner: " + poolSigner.toBase58());

    const memeMint = await createMintWithPriority(connection, payer, poolSigner, null, 6, memeMintKeypair, {
      skipPreflight: true,
      commitment: "confirmed",
    });
    console.log("memeMint: " + memeMint.toBase58());

    const adminSolVault = (
      await getOrCreateAssociatedTokenAccount(connection, payer, quoteToken.mint, admin, true, "confirmed", {
        skipPreflight: true,
      })
    ).address;
    const poolSolVaultid = Keypair.generate();
    const poolSolVault = await createAccount(connection, payer, quoteToken.mint, poolSigner, poolSolVaultid, {
      skipPreflight: true,
      commitment: "confirmed",
    });

    const launchVaultid = Keypair.generate();
    const launchVault = await createAccount(connection, payer, memeMint, poolSigner, launchVaultid, {
      skipPreflight: true,
      commitment: "confirmed",
    });

    console.log(
      `pool id: ${id.toBase58()} memeMint: ${memeMint.toBase58()}, adminSolVault: ${adminSolVault.toBase58()}, poolSolVault: ${poolSolVault.toBase58()}, launchVault: ${launchVault.toBase58()}`,
    );

    const newPoolTxDigest = await memechanProgram.methods
      .newPool()
      .accounts({
        adminQuoteVault: adminSolVault,
        memeVault: launchVault,
        quoteVault: poolSolVault,
        memeMint: memeMint,
        pool: id,
        poolSigner: poolSigner,
        sender: signer.publicKey,
        quoteMint: quoteToken.mint,
        tokenProgram: TOKEN_PROGRAM_ID,
        systemProgram: SystemProgram.programId,
        targetConfig: new PublicKey(MEMECHAN_TARGET_CONFIG),
      })
      .signers([signer])
      .rpc({ skipPreflight: true });

    console.log("new pool tx result: " + newPoolTxDigest);

    await createMetadata(client, { payer, mint: memeMint, poolSigner, poolId: id, metadata: args.tokenMetadata });

    // const coinApi = new CoinAPI();
    // const createCoinResponse = coinApi.({
    //   txDigest: newPoolTxDigest,
    // });

    // console.log("createCoinResponse: " + JSON.stringify(createCoinResponse));

    return new BoundPool(id, signer, poolSolVault, launchVault, client, quoteToken);
  }

  /**
   * Fetches the bound pool account information.
   *
   * @deprecated Please use `fetch2` method
   * @param {Object} [program=this.client.memechanProgram] - The program to use for fetching the account.
   * @param {string} [accountId=this.id] - The ID of the account to fetch.
   * @returns {Promise<T>} - The account information.
   */
  async fetch(program = this.client.memechanProgram, accountId = this.id) {
    const accountInfo = await program.account.boundPool.fetch(accountId, "confirmed");
    return accountInfo;
  }

  /**
   * Fetches the bound pool account information.
   *
   * @param {Connection} connection - The Solana RPC connection.
   * @param {PublicKey} accountId - The ID of the account to fetch.
   * @returns {Promise<T>} - The account information.
   */
  static async fetch2(connection: Connection, accountId: PublicKey) {
    const accountInfo = await CodegenBoundPool.fetch(connection, accountId);

    if (!accountInfo) {
      throw new Error(`[BoundPool.fetch] No account info found for the pool ${accountId}`);
    }

    return accountInfo;
  }

  /**
   * Fetches the account information with retry logic.
   *
   * @param {Object} [program=this.client.memechanProgram] - The program to use for fetching the account.
   * @param {string} [accountId=this.id] - The ID of the account to fetch.
   * @param {number} [retries=3] - The number of retry attempts.
   * @param {number} [delay=1000] - The delay between retry attempts in milliseconds.
   * @returns {Promise<T>} - The account information.
   */
  async fetchWithRetry(program = this.client.memechanProgram, accountId = this.id, retries = 3, delay = 1000) {
    return retry({
      fn: () => this.fetch(program, accountId),
      retries,
      delay,
      functionName: "fetch",
    });
  }

  public static async all(program: Program<MemechanSol>) {
    return program.account.boundPool.all();
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

  public async swapY(input: SwapYArgs): Promise<MemeTicket> {
    const id = Keypair.generate();
    const user = input.user!;
    const payer = input.payer!;

    const pool = input.pool ?? this.id;
    const poolSignerPda = BoundPool.findSignerPda(pool, this.client.memechanProgram.programId);
    const sol_in = input.solAmountIn;
    const meme_out = input.memeTokensOut;

    const userSolAcc =
      input.userSolAcc ??
      (
        await getOrCreateAssociatedTokenAccount(
          this.client.connection,
          payer,
          NATIVE_MINT, // this is a sol acc
          user.publicKey,
          true,
          "confirmed",
          { skipPreflight: true },
        )
      ).address;

    // const balance = await this.client.connection.getBalance(payer.publicKey);
    // console.log(`${balance / LAMPORTS_PER_SOL} SOL`);

    // const modifyComputeUnits = ComputeBudgetProgram.setComputeUnitLimit({
    //   units: 300,
    // });

    // const addPriorityFee = ComputeBudgetProgram.setComputeUnitPrice({
    //   microLamports: 20000,
    // });

    //   transfer(this.client.connection, payer,

    // const transferTx = new Transaction().add(
    //   //  modifyComputeUnits,
    //   // addPriorityFee,
    //   SystemProgram.transfer({
    //     fromPubkey: payer.publicKey,
    //     toPubkey: userSolAcc,
    //     lamports: BigInt(sol_in.toString()),
    //   }),
    //   createSyncNativeInstruction(userSolAcc),
    // );

    // const transferResult = await sendAndConfirmTransaction(this.client.connection, transferTx, [payer], {
    //   skipPreflight: true,
    //   commitment: "confirmed",
    // });

    //console.log("3 transferResult: " + transferResult);

    await this.client.memechanProgram.methods
      .swapY(new BN(sol_in), new BN(meme_out))
      .accounts({
        memeTicket: id.publicKey,
        owner: user.publicKey,
        pool: pool,
        poolSignerPda: poolSignerPda,
        quoteVault: this.solVault,
        userSol: userSolAcc,
        systemProgram: SystemProgram.programId,
        tokenProgram: TOKEN_PROGRAM_ID,
      })
      .signers([user, id])
      .rpc({ skipPreflight: true, commitment: "confirmed" })
      .catch((e) => console.error(e));

    return new MemeTicket(id.publicKey, this.client);
  }

  /**
   * Swaps a Y token (expecting `SLERF` token) for another asset by executing a buy meme transaction.
   * @param {SwapYArgs} input - The input arguments required for the swap.
   * @returns {Promise<string>} A promise that resolves to the transaction ID of the swap.
   * @throws {Error} Throws an error if the transaction creation or confirmation fails.
   * @untested This method is untested and may contain bugs.
   */
  public async buyMeme(input: SwapYArgs): Promise<string> {
    const buyMemeTransaction = await this.getBuyMemeTransaction(input);

    const txId = await sendAndConfirmTransaction(this.client.connection, buyMemeTransaction, [input.user], {
      skipPreflight: true,
      commitment: "confirmed",
    });

    return txId;
  }

  /**
   * Generates a transaction to buy a meme.
   *
   * @todo Implement the full functionality of this method (in regards of accepting different tokens).
   * @todo Add comprehensive examples.
   *
   * @param {GetBuyMemeTransactionArgs} input - The input arguments required for the transaction.
   * @returns {Promise<Transaction>} A promise that resolves to the transaction object.
   *
   * @work-in-progress This method is a work in progress and not yet ready for production use.
   * @untested This method is untested and may contain bugs.
   */
  public async getBuyMemeTransaction(input: GetBuyMemeTransactionArgs): Promise<Transaction> {
    const tx = input.transaction ?? new Transaction();

    const user = input.user;

    const pool = this.id;
    const poolSignerPda = this.findSignerPda();

    // TODO: Change that, we should allow to pass inputMint and outputMint
    const tokenInMintPubkey = NATIVE_MINT;

    const sol_in = input.solAmountIn;
    const meme_out = input.memeTokensOut;

    // TODO: ? We should handle SOL-based and non-SOL based swaps
    let inputTokenUserAccountPubkey: undefined | PublicKey;

    if (input.userSolAcc) {
      inputTokenUserAccountPubkey = input.userSolAcc;
    } else {
      const associatedToken = getAssociatedTokenAddressSync(tokenInMintPubkey, user.publicKey, true);
      inputTokenUserAccountPubkey = associatedToken;

      const createAssociatedTokenAcouuntInstruction = createAssociatedTokenAccountInstruction(
        user.publicKey,
        associatedToken,
        user.publicKey,
        tokenInMintPubkey,
      );

      // Add creation of associated token account
      tx.add(createAssociatedTokenAcouuntInstruction);

      // TODO: We need to remove that once get rid of SOL-based pools
      // Transfer SOL to wSOL
      const transferSolToWSOLAccountInstruction = SystemProgram.transfer({
        fromPubkey: user.publicKey,
        toPubkey: inputTokenUserAccountPubkey,
        lamports: BigInt(sol_in.toString()),
      });
      tx.add(transferSolToWSOLAccountInstruction);

      // TODO: We need to remove that once get rid of SOL-based pools
      // TODO: Double-check do we really need that or not
      // createSyncNativeInstruction(inputTokenUserAccountPubkey);
    }

    // TODO: Why?
    const memeTicketId = Keypair.generate();

    const buyMemeInstruction = await this.client.memechanProgram.methods
      .swapY(new BN(sol_in), new BN(meme_out))
      .accounts({
        memeTicket: memeTicketId.publicKey,
        owner: user.publicKey,
        pool: pool,
        poolSignerPda: poolSignerPda,
        quoteVault: this.solVault,
        userSol: inputTokenUserAccountPubkey,
        systemProgram: SystemProgram.programId,
        tokenProgram: TOKEN_PROGRAM_ID,
      })
      .instruction();

    tx.add(buyMemeInstruction);

    return tx;
  }

  public async swapX(input: SwapXArgs): Promise<string> {
    const sellMemeCoinTransaction = await this.getSellMemeTransaction(input);

    const txId = await sendAndConfirmTransaction(this.client.connection, sellMemeCoinTransaction, [input.user], {
      skipPreflight: true,
      commitment: "confirmed",
    });

    return txId;
  }

  public async getSellMemeTransaction(input: GetSellMemeTransactionArgs): Promise<Transaction> {
    const tx = input.transaction ?? new Transaction();
    const user = input.user;

    const pool = this.id;
    const poolSignerPda = this.findSignerPda();
    const meme_in = input.memeAmountIn;
    const sol_out = input.solTokensOut;

    const memeTicket = input.userMemeTicket;
    const userSolAcc = input.userSolAcc;

    const sellMemeTransactionInstruction = await this.client.memechanProgram.methods
      .swapX(new BN(meme_in), new BN(sol_out))
      .accounts({
        memeTicket: memeTicket.id,
        owner: user.publicKey,
        pool: pool,
        poolSigner: poolSignerPda,
        quoteVault: this.solVault,
        userSol: userSolAcc,
        tokenProgram: TOKEN_PROGRAM_ID,
      })
      .instruction();

    tx.add(sellMemeTransactionInstruction);

    return tx;
  }

  public async getInitStakingPoolTransaction(
    input: GetInitStakingPoolTransactionArgs,
  ): Promise<{ transaction: Transaction; stakingWSolVault: PublicKey; stakingMemeVault: PublicKey }> {
    const { user, pool = this.id, boundPoolInfo } = input;
    const tx = input.transaction ?? new Transaction();

    const stakingId = BoundPool.findStakingPda(boundPoolInfo.memeReserve.mint, this.client.memechanProgram.programId);
    const stakingSigner = StakingPool.findSignerPda(stakingId, this.client.memechanProgram.programId);
    const adminTicketId = BoundPool.findMemeTicketPda(stakingId, this.client.memechanProgram.programId);

    const stakingPoolSolVaultId = Keypair.generate();
    const stakingWSolVault = stakingPoolSolVaultId.publicKey;
    const createWSolAccountInstructions = await getCreateAccountInstructions(
      this.client.connection,
      user,
      this.quoteToken.mint,
      stakingSigner,
      stakingPoolSolVaultId,
      "confirmed",
    );

    tx.add(...createWSolAccountInstructions);

    const stakingMemeVaultId = Keypair.generate();
    const stakingMemeVault = stakingMemeVaultId.publicKey;
    const createMemeAccountInstructions = await getCreateAccountInstructions(
      this.client.connection,
      user,
      boundPoolInfo.memeReserve.mint,
      stakingSigner,
      stakingMemeVaultId,
      "confirmed",
    );

    tx.add(...createMemeAccountInstructions);

    const methodArgs = {
      pool,
      signer: user.publicKey,
      boundPoolSignerPda: this.findSignerPda(),
      memeTicket: adminTicketId,
      poolMemeVault: boundPoolInfo.memeReserve.vault,
      poolQuoteVault: boundPoolInfo.quoteReserve.vault,
      stakingMemeVault,
      stakingQuoteVault: stakingWSolVault,
      quoteMint: this.quoteToken.mint,
      staking: stakingId,
      stakingPoolSignerPda: stakingSigner,
      adminVaultQuote: boundPoolInfo.adminVaultQuote,
      marketProgramId: PROGRAMIDS.OPENBOOK_MARKET,
      systemProgram: SystemProgram.programId,
      tokenProgram: TOKEN_PROGRAM_ID,
      clock: SYSVAR_CLOCK_PUBKEY,
      rent: SYSVAR_RENT_PUBKEY,
      memeMint: boundPoolInfo.memeReserve.mint,
      ataProgram: ATA_PROGRAM_ID,
      user,
    };

    const initStakingPoolInstruction = await this.client.memechanProgram.methods
      .initStakingPool()
      .accounts(methodArgs)
      .instruction();

    tx.add(initStakingPoolInstruction);

    return { transaction: tx, stakingMemeVault, stakingWSolVault };
  }

  public async slowInitStakingPool(input: Partial<InitStakingPoolArgs>): Promise<InitStakingPoolResult> {
    const user = input.user!;
    const pool = input.pool ?? this.id;

    //console.log("initStakingPool fetch: " + this.id.toBase58());
    //const boundPoolInfo = await this.fetch();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const boundPoolInfo = input.boundPoolInfo as any;

    console.log("initStakingPool.boundPoolInfo: " + JSON.stringify(boundPoolInfo));

    const stakingId = BoundPool.findStakingPda(boundPoolInfo.memeReserve.mint, this.client.memechanProgram.programId);
    const stakingSigner = StakingPool.findSignerPda(stakingId, this.client.memechanProgram.programId);

    const adminTicketId = BoundPool.findMemeTicketPda(stakingId, this.client.memechanProgram.programId);

    const stakingPoolSolVaultid = Keypair.generate();
    const stakingWSolVault = await createAccount(
      this.client.connection,
      user,
      this.quoteToken.mint,
      stakingSigner,
      stakingPoolSolVaultid,
      { skipPreflight: true, commitment: "confirmed" },
    );

    const stakingMemeVaultid = Keypair.generate();
    const stakingMemeVault = await createAccount(
      this.client.connection,
      user,
      boundPoolInfo.memeReserve.mint,
      stakingSigner,
      stakingMemeVaultid,
      { skipPreflight: true, commitment: "confirmed" },
    );

    try {
      const methodArgs = {
        pool: pool,
        signer: user.publicKey,
        boundPoolSignerPda: this.findSignerPda(),
        memeTicket: adminTicketId,
        poolMemeVault: boundPoolInfo.memeReserve.vault,
        poolQuoteVault: boundPoolInfo.quoteReserve.vault,
        stakingMemeVault: stakingMemeVault,
        stakingQuoteVault: stakingWSolVault,
        quoteMint: this.quoteToken.mint,
        staking: stakingId,
        stakingPoolSignerPda: stakingSigner,
        adminVaultQuote: boundPoolInfo.adminVaultQuote,
        marketProgramId: PROGRAMIDS.OPENBOOK_MARKET,
        systemProgram: SystemProgram.programId,
        tokenProgram: TOKEN_PROGRAM_ID,
        clock: SYSVAR_CLOCK_PUBKEY,
        rent: SYSVAR_RENT_PUBKEY,
        memeMint: boundPoolInfo.memeReserve.mint,
        ataProgram: ATA_PROGRAM_ID,
        user: user,
      };

      const result = await this.client.memechanProgram.methods
        .initStakingPool()
        .accounts(methodArgs)
        .signers([methodArgs.user])
        .rpc({ skipPreflight: true, commitment: "confirmed" });

      console.log("initStakingPool Final result:", result);

      return { stakingMemeVault, stakingWSolVault };
    } catch (error) {
      console.error("Failed to initialize staking pool:", error);
    }

    return { stakingMemeVault, stakingWSolVault };
  }

  public async initStakingPool(input: InitStakingPoolArgs): Promise<InitStakingPoolResult> {
    const { transaction, stakingMemeVault, stakingWSolVault } = await this.getInitStakingPoolTransaction(input);

    const signAndConfirmInitStakingPoolTransaction = getSendAndConfirmTransactionMethod({
      connection: this.client.connection,
      transaction,
      signers: [input.user],
    });

    await retry({
      fn: signAndConfirmInitStakingPoolTransaction,
      functionName: "initStakingPool",
    });

    return { stakingMemeVault, stakingWSolVault };
  }

  public async goLive(input: GoLiveArgs): Promise<[StakingPool]> {
    const user = input.user!;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const boundPoolInfo = input.boundPoolInfo as any;
    const stakingId = BoundPool.findStakingPda(boundPoolInfo.memeReserve.mint, this.client.memechanProgram.programId);
    const stakingSigner = StakingPool.findSignerPda(stakingId, this.client.memechanProgram.programId);

    console.log("goLive.boundPoolInfo: " + JSON.stringify(boundPoolInfo));

    const baseTokenInfo = new Token(TOKEN_PROGRAM_ID, new PublicKey(boundPoolInfo.memeReserve.mint), 6);
    //const marketId = new PublicKey("AHZCwnUuiB3CUEyk2nybsU5c85WVDTHVP2UwuQwpVaR1");
    const quoteTokenInfo = MEMECHAN_QUOTE_TOKEN;

    const { txids: createMarketTxIds, marketId } = await createMarket({
      baseToken: baseTokenInfo,
      quoteToken: quoteTokenInfo,
      wallet: user.publicKey,
      signer: user,
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

    console.log("marketId", marketId.toBase58());
    console.log("stakingId: " + stakingId.toBase58());

    // const modifyComputeUnits = ComputeBudgetProgram.setComputeUnitLimit({
    //   units: 300,
    // });

    // const addPriorityFee = ComputeBudgetProgram.setComputeUnitPrice({
    //   microLamports: 20000,
    // });

    const transferTx = new Transaction().add(
      // modifyComputeUnits,
      // addPriorityFee,
      SystemProgram.transfer({
        fromPubkey: user.publicKey,
        toPubkey: stakingSigner,
        lamports: 2_000_000_000,
      }),
    );

    const transferSignature = await sendAndConfirmTransaction(this.client.connection, transferTx, [user], {
      skipPreflight: true,
      commitment: "confirmed",
    });

    console.log("transferSignature: " + transferSignature);

    const transferTxBH0 = await this.client.connection.getLatestBlockhash("confirmed");
    const transferTxSyncResult = await this.client.connection.confirmTransaction(
      {
        signature: transferSignature,
        blockhash: transferTxBH0.blockhash,
        lastValidBlockHeight: transferTxBH0.lastValidBlockHeight,
      },
      "confirmed",
    );

    if (transferTxSyncResult.value.err) {
      console.error("transferTxSyncResult error: ", JSON.stringify(transferTxSyncResult));
      throw new Error("transferTxSyncResult failed");
    } else {
      console.log("transferTxSyncResult: " + JSON.stringify(transferTxSyncResult));
    }

    const feeDestination = new PublicKey(input.feeDestinationWalletAddress);
    const ammId = BoundPool.getAssociatedId({ programId: PROGRAMIDS.AmmV4, marketId });
    const raydiumAmmAuthority = BoundPool.getAssociatedAuthority({ programId: PROGRAMIDS.AmmV4 });
    const openOrders = BoundPool.getAssociatedOpenOrders({ programId: PROGRAMIDS.AmmV4, marketId });
    const targetOrders = BoundPool.getAssociatedTargetOrders({ programId: PROGRAMIDS.AmmV4, marketId });
    const ammConfig = BoundPool.getAssociatedConfigId({ programId: PROGRAMIDS.AmmV4 });
    const raydiumLpMint = BoundPool.getAssociatedLpMint({ programId: PROGRAMIDS.AmmV4, marketId });

    const raydiumMemeVault = BoundPool.getAssociatedBaseVault({ programId: PROGRAMIDS.AmmV4, marketId });
    const raydiumWsolVault = BoundPool.getAssociatedQuoteVault({ programId: PROGRAMIDS.AmmV4, marketId });

    const userDestinationLpTokenAta = BoundPool.getATAAddress(stakingSigner, raydiumLpMint, TOKEN_PROGRAM_ID).publicKey;

    const modifyComputeUnits = ComputeBudgetProgram.setComputeUnitLimit({
      units: 250000,
    });

    const addPriorityFee = ComputeBudgetProgram.setComputeUnitPrice({
      microLamports: 5000000,
    });

    // const data = Buffer.from(
    //   Uint8Array.of(0, ...new BN(500000).toArray("le", 4))
    // );
    // const additionalComputeBudgetInstruction = new TransactionInstruction({
    //   keys: [],
    //   programId: new PublicKey("ComputeBudget111111111111111111111111111111"),
    //   data,
    // });

    try {
      const result = await this.client.memechanProgram.methods
        .goLive(raydiumAmmAuthority.nonce)
        .accounts({
          signer: user.publicKey,
          poolMemeVault: input.memeVault,
          poolQuoteVault: input.quoteVault,
          quoteMint: this.quoteToken.mint,
          staking: stakingId,
          stakingPoolSignerPda: stakingSigner,
          raydiumLpMint: raydiumLpMint,
          raydiumAmm: ammId,
          raydiumAmmAuthority: raydiumAmmAuthority.publicKey,
          raydiumMemeVault: raydiumMemeVault,
          raydiumQuoteVault: raydiumWsolVault,
          marketProgramId: PROGRAMIDS.OPENBOOK_MARKET,
          systemProgram: SystemProgram.programId,
          tokenProgram: TOKEN_PROGRAM_ID,
          marketAccount: marketId,
          clock: SYSVAR_CLOCK_PUBKEY,
          rent: SYSVAR_RENT_PUBKEY,
          openOrders: openOrders,
          targetOrders: targetOrders,
          memeMint: boundPoolInfo.memeReserve.mint,
          ammConfig: ammConfig,
          ataProgram: ATA_PROGRAM_ID,
          feeDestinationInfo: feeDestination,
          userDestinationLpTokenAta: userDestinationLpTokenAta,
          raydiumProgram: PROGRAMIDS.AmmV4,
        })
        .signers([user]) // ammid?

        .preInstructions([modifyComputeUnits, addPriorityFee])
        .rpc({ skipPreflight: true, commitment: "confirmed" });
      console.log("goLive Transaction successful:", result);

      return [new StakingPool(stakingId, this.client)];
    } catch (error) {
      if (error instanceof AnchorError) {
        console.error("Error details:", error);
        if (error.logs) {
          error.logs.forEach((log) => console.log("Program log:", log));
        }
      } else {
        console.error("Unexpected error:", error);
      }

      throw error;
    }
  }

  static getATAAddress(owner: PublicKey, mint: PublicKey, programId: PublicKey) {
    return findProgramAddress(
      [owner.toBuffer(), programId.toBuffer(), mint.toBuffer()],
      new PublicKey("ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL"),
    );
  }

  static getAssociatedId({ programId, marketId }: { programId: PublicKey; marketId: PublicKey }) {
    const { publicKey } = findProgramAddress(
      [programId.toBuffer(), marketId.toBuffer(), Buffer.from("amm_associated_seed", "utf-8")],
      programId,
    );
    return publicKey;
  }

  static getAssociatedAuthority({ programId }: { programId: PublicKey }) {
    return findProgramAddress(
      // new Uint8Array(Buffer.from('amm authority'.replace('\u00A0', ' '), 'utf-8'))
      [Buffer.from([97, 109, 109, 32, 97, 117, 116, 104, 111, 114, 105, 116, 121])],
      programId,
    );
  }

  static getAssociatedBaseVault({ programId, marketId }: { programId: PublicKey; marketId: PublicKey }) {
    const { publicKey } = findProgramAddress(
      [programId.toBuffer(), marketId.toBuffer(), Buffer.from("coin_vault_associated_seed", "utf-8")],
      programId,
    );
    return publicKey;
  }

  static getAssociatedQuoteVault({ programId, marketId }: { programId: PublicKey; marketId: PublicKey }) {
    const { publicKey } = findProgramAddress(
      [programId.toBuffer(), marketId.toBuffer(), Buffer.from("pc_vault_associated_seed", "utf-8")],
      programId,
    );
    return publicKey;
  }

  static getAssociatedLpMint({ programId, marketId }: { programId: PublicKey; marketId: PublicKey }) {
    const { publicKey } = findProgramAddress(
      [programId.toBuffer(), marketId.toBuffer(), Buffer.from("lp_mint_associated_seed", "utf-8")],
      programId,
    );
    return publicKey;
  }

  static getAssociatedLpVault({ programId, marketId }: { programId: PublicKey; marketId: PublicKey }) {
    const { publicKey } = findProgramAddress(
      [programId.toBuffer(), marketId.toBuffer(), Buffer.from("temp_lp_token_associated_seed", "utf-8")],
      programId,
    );
    return publicKey;
  }

  static getAssociatedTargetOrders({ programId, marketId }: { programId: PublicKey; marketId: PublicKey }) {
    const { publicKey } = findProgramAddress(
      [programId.toBuffer(), marketId.toBuffer(), Buffer.from("target_associated_seed", "utf-8")],
      programId,
    );
    return publicKey;
  }

  static getAssociatedWithdrawQueue({ programId, marketId }: { programId: PublicKey; marketId: PublicKey }) {
    const { publicKey } = findProgramAddress(
      [programId.toBuffer(), marketId.toBuffer(), Buffer.from("withdraw_associated_seed", "utf-8")],
      programId,
    );
    return publicKey;
  }

  static getAssociatedOpenOrders({ programId, marketId }: { programId: PublicKey; marketId: PublicKey }) {
    const { publicKey } = findProgramAddress(
      [programId.toBuffer(), marketId.toBuffer(), Buffer.from("open_order_associated_seed", "utf-8")],
      programId,
    );
    return publicKey;
  }

  static getAssociatedConfigId({ programId }: { programId: PublicKey }) {
    const { publicKey } = findProgramAddress([Buffer.from("amm_config_account_seed", "utf-8")], programId);
    return publicKey;
  }

  async airdrop(connection: Connection, to: PublicKey, amount: number = 5_000_000_000) {
    await connection.confirmTransaction(await connection.requestAirdrop(to, amount), "confirmed");
  }
}
