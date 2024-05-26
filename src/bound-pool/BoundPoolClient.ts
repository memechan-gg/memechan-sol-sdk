import { Token } from "@raydium-io/raydium-sdk";
import {
  ASSOCIATED_TOKEN_PROGRAM_ID,
  TOKEN_PROGRAM_ID,
  createAssociatedTokenAccountInstruction,
  getAccount,
  getAssociatedTokenAddressSync,
  getOrCreateAssociatedTokenAccount,
  mintTo,
} from "@solana/spl-token";
import {
  ComputeBudgetProgram,
  Connection,
  Keypair,
  PublicKey,
  SYSVAR_CLOCK_PUBKEY,
  SYSVAR_RENT_PUBKEY,
  Signer,
  SystemProgram,
  Transaction,
  VersionedTransaction,
  sendAndConfirmTransaction,
} from "@solana/web3.js";
import BigNumber from "bignumber.js";
import {
  BoundPool,
  BoundPoolFields,
  BoundPool as CodegenBoundPool,
  MemeTicketFields,
} from "../schema/codegen/accounts";

import { BN, Program, Provider } from "@coral-xyz/anchor";
import { MemechanClient } from "../MemechanClient";
import { MemeTicketClient } from "../memeticket/MemeTicketClient";
import { ATA_PROGRAM_ID, PROGRAMIDS } from "../raydium/config";
import { getCreateMarketTransactions } from "../raydium/openBookCreateMarket";
import { StakingPoolClient } from "../staking-pool/StakingPoolClient";
import {
  BoundPoolArgs,
  BuyMemeArgs,
  GetBuyMemeTransactionArgs,
  GetBuyMemeTransactionOutput,
  GetCreateNewBondingPoolAndTokenTransactionArgs,
  GetGoLiveTransactionArgs,
  GetInitStakingPoolTransactionArgs,
  GetOutputAmountForBuyMeme,
  GetOutputAmountForSellMemeArgs,
  GetSellMemeTransactionArgs,
  GetSellMemeTransactionArgsLegacy,
  GetSellMemeTransactionOutput,
  GoLiveArgs,
  InitStakingPoolArgs,
  InitStakingPoolResult,
  SellMemeArgs,
  SwapXArgs,
  SwapYArgs,
} from "./types";

import { findProgramAddress } from "../common/helpers";
import {
  DEFAULT_MAX_M,
  FULL_MEME_AMOUNT_CONVERTED,
  MEMECHAN_MEME_TOKEN_DECIMALS,
  MEMECHAN_QUOTE_MINT,
  MEMECHAN_QUOTE_TOKEN,
  MEMECHAN_QUOTE_TOKEN_DECIMALS,
  MEMECHAN_TARGET_CONFIG,
  RAYDIUM_PROTOCOL_FEE,
  TRANSFER_FEE,
} from "../config/config";
import { LivePoolClient } from "../live-pool/LivePoolClient";
import { MemechanSol } from "../schema/types/memechan_sol";
import { getCreateMetadataTransaction } from "../token/createMetadata";
import { getCreateMintWithPriorityTransaction } from "../token/getCreateMintWithPriorityTransaction";
import { NewBPInstructionParsed } from "../tx-parsing/parsers/bonding-pool-creation-parser";
import { parseTx } from "../tx-parsing/parsing";
import { sendTx } from "../util";
import { getTxSize } from "../util/get-tx-size";
import { getCreateAccountInstructions } from "../util/getCreateAccountInstruction";
import { getSendAndConfirmTransactionMethod } from "../util/getSendAndConfirmTransactionMethod";
import { retry } from "../util/retry";
import { deductSlippage } from "../util/trading/deductSlippage";
import { extractSwapDataFromSimulation } from "../util/trading/extractSwapDataFromSimulation";
import { getOptimizedTransactions } from "../memeticket/utils";
import { ParsedMemeTicket } from "../memeticket/types";
import { normalizeInputCoinAmount } from "../util/trading/normalizeInputCoinAmount";

export class BoundPoolClient {
  private constructor(
    public id: PublicKey,
    public client: MemechanClient,
    public memeVault: PublicKey,
    public quoteVault: PublicKey,
    public memeTokenMint: PublicKey,
    public quoteTokenMint: PublicKey = MEMECHAN_QUOTE_MINT,
    public memeToken: Token,
  ) {
    //
  }

  public static async fromBoundPoolId({
    client,
    poolAccountAddressId,
  }: {
    client: MemechanClient;
    poolAccountAddressId: PublicKey;
  }) {
    const poolObjectData = await BoundPoolClient.fetch2(client.connection, poolAccountAddressId);

    const boundClientInstance = new BoundPoolClient(
      poolAccountAddressId,
      client,
      poolObjectData.memeReserve.vault,
      poolObjectData.quoteReserve.vault,
      poolObjectData.memeReserve.mint,
      poolObjectData.quoteReserve.mint,
      new Token(TOKEN_PROGRAM_ID, poolObjectData.memeReserve.mint, MEMECHAN_MEME_TOKEN_DECIMALS),
    );

    return boundClientInstance;
  }

  public static async fromPoolCreationTransaction({
    client,
    poolCreationSignature,
  }: {
    client: MemechanClient;
    poolCreationSignature: string;
  }) {
    const parsedData = await parseTx(poolCreationSignature, client);
    console.debug("parsedData: ", parsedData);

    if (!parsedData) {
      throw new Error(`No such pool found for such signature ${poolCreationSignature}`);
    }

    const newPoolInstructionData = parsedData.find((el): el is NewBPInstructionParsed => el.type === "new_pool");

    if (!newPoolInstructionData) {
      throw new Error(`No such pool found in instruction data for signature ${poolCreationSignature}`);
    }

    const poolObjectData = await BoundPoolClient.fetch2(client.connection, newPoolInstructionData.poolAddr);

    const boundClientInstance = new BoundPoolClient(
      newPoolInstructionData.poolAddr,
      client,
      poolObjectData.memeReserve.vault,
      poolObjectData.quoteReserve.vault,
      poolObjectData.memeReserve.mint,
      poolObjectData.quoteReserve.mint,
      new Token(TOKEN_PROGRAM_ID, poolObjectData.memeReserve.mint, 6), // TODO fix 6 decimals
    );

    return boundClientInstance;
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
  ): Promise<{
    createPoolTransaction: Transaction;
    createTokenTransaction: Transaction;
    memeMintKeypair: Keypair;
    poolQuoteVaultId: Keypair;
    launchVaultId: Keypair;
  }> {
    const {
      admin,
      payer,
      client,
      quoteToken,
      transaction: createPoolTransaction = new Transaction(),
      adminSolPublicKey,
      tokenMetadata,
    } = args;
    const { connection, memechanProgram } = client;

    const memeMintKeypair = Keypair.generate();
    const memeMint = memeMintKeypair.publicKey;
    const id = this.findBoundPoolPda(memeMintKeypair.publicKey, quoteToken.mint, args.client.memechanProgram.programId);
    const poolSigner = BoundPoolClient.findSignerPda(id, args.client.memechanProgram.programId);

    const createMemeMintWithPriorityInstructions = (
      await getCreateMintWithPriorityTransaction(
        connection,
        payer,
        poolSigner,
        null,
        MEMECHAN_MEME_TOKEN_DECIMALS,
        memeMintKeypair,
      )
    ).instructions;

    createPoolTransaction.add(...createMemeMintWithPriorityInstructions);

    let adminQuoteVault: PublicKey | undefined = adminSolPublicKey;

    // If `adminSolPublicKey` is not passed in args, we need to find out, whether a quote account for an admin
    // already exists
    if (!adminQuoteVault) {
      const associatedToken = getAssociatedTokenAddressSync(
        quoteToken.mint,
        admin,
        true,
        TOKEN_PROGRAM_ID,
        ASSOCIATED_TOKEN_PROGRAM_ID,
      );

      adminQuoteVault = (await getAccount(connection, associatedToken)).address;

      // If the quote account for the admin doesn't exist, add an instruction to create it
      if (!adminQuoteVault) {
        const associatedTransactionInstruction = createAssociatedTokenAccountInstruction(
          payer,
          associatedToken,
          admin,
          quoteToken.mint,
          TOKEN_PROGRAM_ID,
          ASSOCIATED_TOKEN_PROGRAM_ID,
        );

        createPoolTransaction.add(associatedTransactionInstruction);

        adminQuoteVault = associatedToken;
      }
    }

    const poolQuoteVaultId = Keypair.generate();
    const poolQuoteVault = poolQuoteVaultId.publicKey;
    const createPoolQuoteVaultInstructions = await getCreateAccountInstructions(
      connection,
      payer,
      quoteToken.mint,
      poolSigner,
      poolQuoteVaultId,
    );

    createPoolTransaction.add(...createPoolQuoteVaultInstructions);

    const launchVaultId = Keypair.generate();
    const launchVault = launchVaultId.publicKey;
    const createLaunchVaultInstructions = await getCreateAccountInstructions(
      connection,
      payer,
      memeMint,
      poolSigner,
      launchVaultId,
    );

    createPoolTransaction.add(...createLaunchVaultInstructions);

    const createPoolInstruction = await memechanProgram.methods
      .newPool()
      .accounts({
        adminQuoteVault: adminQuoteVault,
        memeVault: launchVault,
        quoteVault: poolQuoteVault,
        memeMint: memeMint,
        pool: id,
        poolSigner: poolSigner,
        sender: payer,
        quoteMint: quoteToken.mint,
        tokenProgram: TOKEN_PROGRAM_ID,
        systemProgram: SystemProgram.programId,
        // TODO: Replace it in a way, that it would respect any target config, not only a hardcoded one
        targetConfig: MEMECHAN_TARGET_CONFIG,
      })
      .instruction();

    createPoolTransaction.add(createPoolInstruction);

    const createTokenTransaction = new Transaction();

    const createTokenInstructions = (
      await getCreateMetadataTransaction(client, {
        payer,
        mint: memeMint,
        poolSigner,
        poolId: id,
        metadata: tokenMetadata,
      })
    ).instructions;

    createTokenTransaction.add(...createTokenInstructions);

    return {
      createPoolTransaction,
      createTokenTransaction,
      memeMintKeypair,
      poolQuoteVaultId,
      launchVaultId,
    };
  }

  public static async new(args: BoundPoolArgs): Promise<BoundPoolClient> {
    const { payer, client, quoteToken } = args;
    const { memechanProgram } = client;

    const { createPoolTransaction, createTokenTransaction, memeMintKeypair, poolQuoteVaultId, launchVaultId } =
      await this.getCreateNewBondingPoolAndTokenTransaction({ ...args, payer: payer.publicKey });

    const memeMint = memeMintKeypair.publicKey;
    const poolQuoteVault = poolQuoteVaultId.publicKey;
    const launchVault = launchVaultId.publicKey;

    const createPoolTransactionSize = getTxSize(createPoolTransaction, payer.publicKey);
    console.debug("createPoolTransaction size: ", createPoolTransactionSize);

    const createTokenTransactionSize = getTxSize(createTokenTransaction, payer.publicKey);
    console.debug("createTokenTransaction size: ", createTokenTransactionSize);

    const createPoolMethod = getSendAndConfirmTransactionMethod({
      connection: client.connection,
      transaction: createPoolTransaction,
      signers: [payer, memeMintKeypair, poolQuoteVaultId, launchVaultId],
      options: {
        commitment: "confirmed",
        skipPreflight: true,
      },
    });

    await retry({
      fn: createPoolMethod,
      functionName: "createPoolMethod",
    });

    const createTokenMethod = getSendAndConfirmTransactionMethod({
      connection: client.connection,
      transaction: createTokenTransaction,
      signers: [payer],
      options: {
        commitment: "confirmed",
        skipPreflight: true,
      },
    });

    await retry({
      fn: createTokenMethod,
      functionName: "createTokenMethod",
    });

    // const createPoolSignature = await sendAndConfirmTransaction(
    //   client.connection,
    //   createPoolTransaction,
    //   [payer, memeMintKeypair, poolQuoteVaultId, launchVaultId],
    //   {
    //     commitment: "confirmed",
    //     skipPreflight: true,
    //   },
    // );
    // console.log("createPoolSignature:", createPoolSignature);

    // const createTokenSignature = await sendAndConfirmTransaction(client.connection, createTokenTransaction, [payer], {
    //   commitment: "confirmed",
    //   skipPreflight: true,
    // });
    // console.log("createTokenSignature:", createTokenSignature);

    const id = this.findBoundPoolPda(memeMint, quoteToken.mint, memechanProgram.programId);

    return new BoundPoolClient(
      id,
      client,
      launchVault,
      poolQuoteVault,
      memeMint,
      quoteToken.mint,
      new Token(TOKEN_PROGRAM_ID, memeMint, MEMECHAN_MEME_TOKEN_DECIMALS),
    );
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
      throw new Error(`[BoundPoolClient.fetch] No account info found for the pool ${accountId}`);
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

  public static async all(
    program: Program<MemechanSol>,
  ): Promise<{ account: BoundPoolFields; publicKey: PublicKey }[]> {
    const rawPools = await program.account.boundPool.all();
    const pools = rawPools.map((el) => el);

    return pools;
  }

  public findSignerPda(): PublicKey {
    return BoundPoolClient.findSignerPda(this.id, this.client.memechanProgram.programId);
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

  public async swapY(input: SwapYArgs): Promise<MemeTicketClient> {
    const id = Keypair.generate();
    const user = input.user!;
    const payer = input.payer!;

    const pool = input.pool ?? this.id;
    const poolSignerPda = BoundPoolClient.findSignerPda(pool, this.client.memechanProgram.programId);
    const solIn = input.quoteAmountIn;
    const memeOut = input.memeTokensOut;

    const userQuoteAcc =
      input.userSolAcc ??
      (
        await getOrCreateAssociatedTokenAccount(
          this.client.connection,
          payer,
          input.quoteMint,
          user.publicKey,
          true,
          "confirmed",
          { skipPreflight: true },
        )
      ).address;

    await this.client.memechanProgram.methods
      .swapY(new BN(solIn), new BN(memeOut))
      .accounts({
        memeTicket: id.publicKey,
        owner: user.publicKey,
        pool: pool,
        poolSignerPda: poolSignerPda,
        quoteVault: this.quoteVault,
        userSol: userQuoteAcc,
        systemProgram: SystemProgram.programId,
        tokenProgram: TOKEN_PROGRAM_ID,
      })
      .signers([user, id])
      .rpc({ skipPreflight: true, commitment: "confirmed" })
      .catch((e) => console.error(e));

    return new MemeTicketClient(id.publicKey, this.client);
  }

  /**
   * Swaps a Y token (expecting `SLERF` token) for another asset by executing a buy meme transaction.
   * @param {SwapYArgs} input - The input arguments required for the swap.
   * @returns {Promise<string>} A promise that resolves to the transaction ID of the swap.
   * @throws {Error} Throws an error if the transaction creation or confirmation fails.
   * @untested This method is untested and may contain bugs.
   */
  public async buyMeme(input: BuyMemeArgs): Promise<string> {
    // TODO: Check whether user has enough amount of quoute token
    const { tx, memeTicketKeypair } = await this.getBuyMemeTransaction(input);

    const txId = await sendAndConfirmTransaction(this.client.connection, tx, [input.signer, memeTicketKeypair], {
      skipPreflight: true,
      commitment: "confirmed",
    });

    return txId;
  }

  /**
   * Generates a transaction to buy a meme.
   *
   * @param {GetBuyMemeTransactionArgs} input - The input arguments required for the transaction.
   * @returns {Promise<GetBuyMemeTransactionOutput>} A promise that resolves to the transaction object.
   *
   * @work-in-progress This method is a work in progress and not yet ready for production use.
   * @untested This method is untested and may contain bugs.
   */
  public async getBuyMemeTransaction(input: GetBuyMemeTransactionArgs): Promise<GetBuyMemeTransactionOutput> {
    const { inputAmount, minOutputAmount, slippagePercentage, user, transaction = new Transaction() } = input;
    let { inputTokenAccount } = input;

    const pool = this.id;
    const poolSignerPda = this.findSignerPda();
    const memeTicketKeypair = Keypair.generate();
    const connection = this.client.connection;

    // input
    const inputAmountWithDecimals = normalizeInputCoinAmount(inputAmount, MEMECHAN_QUOTE_TOKEN_DECIMALS);
    const inputAmountBN = new BN(inputAmountWithDecimals.toString());

    // output
    // Note: Be aware, we relay on the fact that `MEMECOIN_DECIMALS` would be always set same for all memecoins
    // As well as the fact that memecoins and tickets decimals are always the same
    const minOutputWithSlippage = deductSlippage(new BigNumber(minOutputAmount), slippagePercentage);
    const minOutputNormalized = normalizeInputCoinAmount(
      minOutputWithSlippage.toString(),
      MEMECHAN_MEME_TOKEN_DECIMALS,
    );
    const minOutputBN = new BN(minOutputNormalized.toString());

    // If `inputTokenAccount` is not passed in args, we need to find out, whether a quote account for an admin
    // already exists
    if (!inputTokenAccount) {
      const associatedToken = getAssociatedTokenAddressSync(
        this.quoteTokenMint,
        user,
        true,
        TOKEN_PROGRAM_ID,
        ASSOCIATED_TOKEN_PROGRAM_ID,
      );

      const account = await getAccount(connection, associatedToken);
      inputTokenAccount = account.address;

      // If the quote account for the admin doesn't exist, add an instruction to create it
      if (!inputTokenAccount) {
        const associatedTransactionInstruction = createAssociatedTokenAccountInstruction(
          user,
          associatedToken,
          user,
          this.quoteTokenMint,
          TOKEN_PROGRAM_ID,
          ASSOCIATED_TOKEN_PROGRAM_ID,
        );

        transaction.add(associatedTransactionInstruction);

        inputTokenAccount = associatedToken;
      }
    }

    const buyMemeInstruction = await this.client.memechanProgram.methods
      .swapY(inputAmountBN, minOutputBN)
      .accounts({
        memeTicket: memeTicketKeypair.publicKey,
        owner: user,
        pool: pool,
        poolSignerPda: poolSignerPda,
        quoteVault: this.quoteVault,
        userSol: inputTokenAccount,
        systemProgram: SystemProgram.programId,
        tokenProgram: TOKEN_PROGRAM_ID,
      })
      .instruction();

    transaction.add(buyMemeInstruction);

    return { tx: transaction, memeTicketKeypair, inputTokenAccount };
  }

  // TODO(?): Handle for 0 input
  // TODO(?): Handle for very huge number
  public async getOutputAmountForBuyMeme(input: GetOutputAmountForBuyMeme) {
    const { inputAmount, slippagePercentage, transaction = new Transaction() } = input;
    const pool = this.id;

    // input & output
    const inputAmountWithDecimals = normalizeInputCoinAmount(inputAmount, MEMECHAN_QUOTE_TOKEN_DECIMALS);
    const inputAmountBN = new BN(inputAmountWithDecimals.toString());
    const minOutputBN = new BN(0);

    const getOutputAmountBuyMemeInstruction = await this.client.memechanProgram.methods
      .getSwapYAmt(inputAmountBN, minOutputBN)
      .accounts({
        pool: pool,
        quoteVault: this.quoteVault,
      })
      .instruction();

    transaction.add(getOutputAmountBuyMemeInstruction);

    const result = await this.client.connection.simulateTransaction(transaction, [this.client.simulationKeypair], true);

    // If error happened (e.g. pool is locked)
    if (result.value.err) {
      console.debug("[getOutputAmountForBuyMeme] error on simulation ", JSON.stringify(result.value));
      throw new Error("Simulation results for getOutputAmountForBuyMeme returned error");
    }

    const { swapOutAmount } = extractSwapDataFromSimulation(result);

    // output
    // Note: Be aware, we relay on the fact that `MEMECOIN_DECIMALS` would be always set same for all memecoins
    // As well as the fact that memecoins and tickets decimals are always the same
    const outputAmount = new BigNumber(swapOutAmount).div(10 ** MEMECHAN_MEME_TOKEN_DECIMALS);
    const outputAmountRespectingSlippage = deductSlippage(outputAmount, slippagePercentage);

    return outputAmountRespectingSlippage.toString();
  }

  public async sellMeme(input: SellMemeArgs): Promise<string[]> {
    const { txs } = await this.getSellMemeTransaction(input);
    const txIdList: string[] = [];

    for (const tx of txs) {
      const signature = await sendAndConfirmTransaction(this.client.connection, tx, [input.signer], {
        commitment: "confirmed",
        skipPreflight: true,
      });

      txIdList.push(signature);
      console.log("tx signature:", signature);
    }

    return txIdList;
  }

  public async getSellMemeTransaction(input: GetSellMemeTransactionArgs): Promise<GetSellMemeTransactionOutput> {
    const { inputAmount, minOutputAmount, slippagePercentage, user, transaction = new Transaction() } = input;
    let { outputTokenAccount } = input;

    const pool = this.id;
    const poolSignerPda = this.findSignerPda();
    const connection = this.client.connection;

    // Check that user has enough available tickets
    const { availableAmountWithDecimals, tickets } = await MemeTicketClient.fetchAvailableTicketsByUser(
      pool,
      this.client,
      user,
    );

    // console.debug("availableAmountWithDecimals: ", availableAmountWithDecimals);
    // console.debug("tickets: ", tickets);

    const isInputTicketAmountIsLargerThanAvailable = new BigNumber(inputAmount).isGreaterThan(
      new BigNumber(availableAmountWithDecimals),
    );

    if (isInputTicketAmountIsLargerThanAvailable) {
      throw new Error(
        "Provided inputTicketAmount is larger than available ticket amount for sell. " +
          `Available ticket amount: ${availableAmountWithDecimals}`,
      );
    }
    // input
    const inputAmountWithDecimals = normalizeInputCoinAmount(inputAmount, MEMECHAN_MEME_TOKEN_DECIMALS);
    const inputAmountBN = new BN(inputAmountWithDecimals.toString());
    const inputAmountBignumber = new BigNumber(inputAmountWithDecimals.toString());

    // output
    // Note: Be aware, we relay on the fact that `MEMECHAN_QUOTE_TOKEN_DECIMALS`
    // would be always set same for all memecoins
    // As well as the fact that memecoins and tickets decimals are always the same
    const minOutputWithSlippage = deductSlippage(new BigNumber(minOutputAmount), slippagePercentage);
    const minOutputNormalized = normalizeInputCoinAmount(
      minOutputWithSlippage.toString(),
      MEMECHAN_QUOTE_TOKEN_DECIMALS,
    );
    const minOutputBN = new BN(minOutputNormalized.toString());

    // If `outputTokenAccount` is not passed in args, we need to find out, whether a outputTokenAccount exists for user
    if (!outputTokenAccount) {
      const associatedToken = getAssociatedTokenAddressSync(
        this.quoteTokenMint,
        user,
        true,
        TOKEN_PROGRAM_ID,
        ASSOCIATED_TOKEN_PROGRAM_ID,
      );

      const account = await getAccount(connection, associatedToken);
      outputTokenAccount = account.address;

      // If doesn't exist, add an instruction to create it
      if (!outputTokenAccount) {
        const associatedTransactionInstruction = createAssociatedTokenAccountInstruction(
          user,
          associatedToken,
          user,
          this.quoteTokenMint,
          TOKEN_PROGRAM_ID,
          ASSOCIATED_TOKEN_PROGRAM_ID,
        );

        transaction.add(associatedTransactionInstruction);

        outputTokenAccount = associatedToken;
      }
    }

    const { ticketsRequiredToSell, isMoreThanOneTicket } = await MemeTicketClient.getRequiredTicketsToSell({
      amount: inputAmountBignumber,
      availableTickets: tickets,
    });

    // TODO: We need to close tickets if there is no money left in the ticket
    let destinationTicket: ParsedMemeTicket;
    if (isMoreThanOneTicket) {
      const [destinationTicketRaw, ...ticketsToMerge] = ticketsRequiredToSell;
      destinationTicket = destinationTicketRaw;
      const destinationMemeticketInstance = new MemeTicketClient(destinationTicketRaw.id, this.client);

      const boundMergeTransaction = await destinationMemeticketInstance.getBoundMergeTransaction({
        pool,
        ticketsToMerge: ticketsToMerge,
        user,
      });
      transaction.add(...boundMergeTransaction.instructions);
    } else {
      destinationTicket = ticketsRequiredToSell[0];
    }

    const sellMemeTransactionInstruction = await this.client.memechanProgram.methods
      .swapX(new BN(inputAmountBN), new BN(minOutputBN))
      .accounts({
        memeTicket: destinationTicket.id,
        owner: user,
        pool: pool,
        poolSigner: poolSignerPda,
        quoteVault: this.quoteVault,
        userSol: outputTokenAccount,
        tokenProgram: TOKEN_PROGRAM_ID,
      })
      .instruction();

    transaction.add(sellMemeTransactionInstruction);

    const optimizedTransactions = getOptimizedTransactions(transaction.instructions, input.user);

    return { txs: optimizedTransactions, isMoreThanOneTransaction: optimizedTransactions.length > 1 };
  }

  // TODO(?): Handle for 0 input
  // TODO(?): Handle for very huge number
  public async getOutputAmountForSellMeme(input: GetOutputAmountForSellMemeArgs) {
    const { inputAmount, slippagePercentage, transaction = new Transaction() } = input;
    const pool = this.id;

    // input & output
    const inputAmountWithDecimals = normalizeInputCoinAmount(inputAmount, MEMECHAN_MEME_TOKEN_DECIMALS);
    const inputAmountBN = new BN(inputAmountWithDecimals.toString());
    const minOutputBN = new BN(0);

    const getOutputAmountBuyMemeInstruction = await this.client.memechanProgram.methods
      .getSwapXAmt(inputAmountBN, minOutputBN)
      .accounts({
        pool: pool,
        quoteVault: this.quoteVault,
      })
      .instruction();

    transaction.add(getOutputAmountBuyMemeInstruction);

    const result = await this.client.connection.simulateTransaction(transaction, [this.client.simulationKeypair], true);

    // If error happened (e.g. pool is locked)
    if (result.value.err) {
      console.debug("[getOutputAmountForBuyMeme] error on simulation ", JSON.stringify(result.value));
      throw new Error("Simulation results for getOutputAmountForBuyMeme returned error");
    }

    const { swapOutAmount } = extractSwapDataFromSimulation(result);

    // output
    // Note: Be aware, we relay on the fact that `MEMECOIN_DECIMALS` would be always set same for all memecoins
    // As well as the fact that memecoins and tickets decimals are always the same
    const outputAmount = new BigNumber(swapOutAmount).div(10 ** MEMECHAN_QUOTE_TOKEN_DECIMALS);
    const outputAmountRespectingSlippage = deductSlippage(outputAmount, slippagePercentage);

    return outputAmountRespectingSlippage.toString();
  }

  public async isMemeCoinReadyToLivePhase() {
    const poolData = await BoundPoolClient.fetch2(this.client.connection, this.id);
    const isPoolLocked = poolData.locked;

    return isPoolLocked;
  }

  public async swapX(input: SwapXArgs): Promise<string> {
    const sellMemeCoinTransaction = await this.getSellMemeTransactionLegacy(input);

    const txId = await sendAndConfirmTransaction(this.client.connection, sellMemeCoinTransaction, [input.user], {
      skipPreflight: true,
      commitment: "confirmed",
    });

    return txId;
  }

  public async getSellMemeTransactionLegacy(input: GetSellMemeTransactionArgsLegacy): Promise<Transaction> {
    const tx = input.transaction ?? new Transaction();
    const user = input.user;

    const pool = this.id;
    const poolSignerPda = this.findSignerPda();
    const memeIn = input.memeAmountIn;
    const minQuoteAmountOut = input.minQuoteAmountOut;

    const memeTicket = input.userMemeTicket;
    const userSolAcc = input.userQuoteAcc;

    const sellMemeTransactionInstruction = await this.client.memechanProgram.methods
      .swapX(new BN(memeIn), new BN(minQuoteAmountOut))
      .accounts({
        memeTicket: memeTicket.id,
        owner: user.publicKey,
        pool: pool,
        poolSigner: poolSignerPda,
        quoteVault: this.quoteVault,
        userSol: userSolAcc,
        tokenProgram: TOKEN_PROGRAM_ID,
      })
      .instruction();

    tx.add(sellMemeTransactionInstruction);

    return tx;
  }

  public async getInitStakingPoolTransaction(
    input: GetInitStakingPoolTransactionArgs,
  ): Promise<{ transaction: Transaction; stakingQuoteVaultId: Keypair; stakingMemeVaultId: Keypair }> {
    const { user, pool = this.id, boundPoolInfo } = input;
    const tx = input.transaction ?? new Transaction();

    const stakingId = BoundPoolClient.findStakingPda(
      boundPoolInfo.memeReserve.mint,
      this.client.memechanProgram.programId,
    );
    const stakingSigner = StakingPoolClient.findSignerPda(stakingId, this.client.memechanProgram.programId);
    const adminTicketId = BoundPoolClient.findMemeTicketPda(stakingId, this.client.memechanProgram.programId);

    const stakingQuoteVaultId = Keypair.generate();
    const stakingQuoteVault = stakingQuoteVaultId.publicKey;
    const createWSolAccountInstructions = await getCreateAccountInstructions(
      this.client.connection,
      user,
      this.quoteTokenMint,
      stakingSigner,
      stakingQuoteVaultId,
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
      signer: user,
      boundPoolSignerPda: this.findSignerPda(),
      memeTicket: adminTicketId,
      poolMemeVault: boundPoolInfo.memeReserve.vault,
      poolQuoteVault: boundPoolInfo.quoteReserve.vault,
      stakingMemeVault,
      stakingQuoteVault: stakingQuoteVault,
      quoteMint: this.quoteTokenMint,
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

    return { transaction: tx, stakingMemeVaultId, stakingQuoteVaultId };
  }

  public async initStakingPool(input: InitStakingPoolArgs): Promise<InitStakingPoolResult> {
    const { transaction, stakingMemeVaultId, stakingQuoteVaultId } = await this.getInitStakingPoolTransaction({
      ...input,
      user: input.user.publicKey,
    });
    const stakingMemeVault = stakingMemeVaultId.publicKey;
    const stakingQuoteVault = stakingQuoteVaultId.publicKey;

    const signAndConfirmInitStakingPoolTransaction = getSendAndConfirmTransactionMethod({
      connection: this.client.connection,
      transaction,
      signers: [input.user, stakingMemeVaultId, stakingQuoteVaultId],
    });

    await retry({
      fn: signAndConfirmInitStakingPoolTransaction,
      functionName: "initStakingPool",
    });

    return { stakingMemeVault, stakingQuoteVault };
  }

  public async getGoLiveTransaction(args: GetGoLiveTransactionArgs): Promise<{
    createMarketTransactions: (Transaction | VersionedTransaction)[];
    goLiveTransaction: Transaction;
    stakingId: PublicKey;
    ammId: PublicKey;
  }> {
    const {
      boundPoolInfo,
      user,
      feeDestinationWalletAddress,
      memeVault,
      quoteVault,
      transaction = new Transaction(),
    } = args;
    const stakingId = BoundPoolClient.findStakingPda(
      boundPoolInfo.memeReserve.mint,
      this.client.memechanProgram.programId,
    );
    const stakingSigner = StakingPoolClient.findSignerPda(stakingId, this.client.memechanProgram.programId);
    const baseTokenInfo = new Token(
      TOKEN_PROGRAM_ID,
      new PublicKey(boundPoolInfo.memeReserve.mint),
      MEMECHAN_MEME_TOKEN_DECIMALS,
    );
    const quoteTokenInfo = MEMECHAN_QUOTE_TOKEN;

    // TODO: Put all the transactions into one (now they exceed trx size limit)
    const { marketId, transactions: createMarketTransactions } = await getCreateMarketTransactions({
      baseToken: baseTokenInfo,
      quoteToken: quoteTokenInfo,
      wallet: user.publicKey,
      signer: user,
      connection: this.client.connection,
    });
    // const createMarketInstructions = getCreateMarketInstructions(transactions);
    // createMarketTransaction.add(...createMarketInstructions);

    transaction.add(
      SystemProgram.transfer({
        fromPubkey: user.publicKey,
        toPubkey: stakingSigner,
        lamports: RAYDIUM_PROTOCOL_FEE + TRANSFER_FEE,
      }),
    );

    const modifyComputeUnits = ComputeBudgetProgram.setComputeUnitLimit({
      units: 250000,
    });

    transaction.add(modifyComputeUnits);

    const addPriorityFee = ComputeBudgetProgram.setComputeUnitPrice({
      microLamports: 5_000,
    });

    transaction.add(addPriorityFee);

    const feeDestination = new PublicKey(feeDestinationWalletAddress);
    const ammId = BoundPoolClient.getAssociatedId({ programId: PROGRAMIDS.AmmV4, marketId });
    const raydiumAmmAuthority = BoundPoolClient.getAssociatedAuthority({ programId: PROGRAMIDS.AmmV4 });
    const openOrders = BoundPoolClient.getAssociatedOpenOrders({ programId: PROGRAMIDS.AmmV4, marketId });
    const targetOrders = BoundPoolClient.getAssociatedTargetOrders({ programId: PROGRAMIDS.AmmV4, marketId });
    const ammConfig = BoundPoolClient.getAssociatedConfigId({ programId: PROGRAMIDS.AmmV4 });
    const raydiumLpMint = BoundPoolClient.getAssociatedLpMint({ programId: PROGRAMIDS.AmmV4, marketId });
    const raydiumMemeVault = BoundPoolClient.getAssociatedBaseVault({ programId: PROGRAMIDS.AmmV4, marketId });
    const raydiumWsolVault = BoundPoolClient.getAssociatedQuoteVault({ programId: PROGRAMIDS.AmmV4, marketId });

    const userDestinationLpTokenAta = BoundPoolClient.getATAAddress(
      stakingSigner,
      raydiumLpMint,
      TOKEN_PROGRAM_ID,
    ).publicKey;

    const goLiveInstruction = await this.client.memechanProgram.methods
      .goLive(raydiumAmmAuthority.nonce)
      .accounts({
        signer: user.publicKey,
        poolMemeVault: memeVault,
        poolQuoteVault: quoteVault,
        quoteMint: this.quoteTokenMint,
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
      .instruction();

    transaction.add(goLiveInstruction);

    return { createMarketTransactions, goLiveTransaction: transaction, stakingId, ammId };
  }

  public async goLive(args: GoLiveArgs): Promise<[StakingPoolClient, LivePoolClient]> {
    return await retry({ fn: () => this.goLiveInternal(args), functionName: "goLive", retries: 10 });
  }

  private async goLiveInternal(args: GoLiveArgs): Promise<[StakingPoolClient, LivePoolClient]> {
    // Get needed transactions
    const { createMarketTransactions, goLiveTransaction, stakingId, ammId } = await this.getGoLiveTransaction(args);

    // Send transaction to create market
    const createMarketSignatures = await sendTx(this.client.connection, args.user, createMarketTransactions, {
      skipPreflight: true,
    });
    console.log("create market signatures:", JSON.stringify(createMarketSignatures));

    // Check market is created successfully
    const { blockhash, lastValidBlockHeight } = await this.client.connection.getLatestBlockhash("confirmed");
    const createMarketTxResult = await this.client.connection.confirmTransaction(
      {
        signature: createMarketSignatures[0],
        blockhash: blockhash,
        lastValidBlockHeight: lastValidBlockHeight,
      },
      "confirmed",
    );

    if (createMarketTxResult.value.err) {
      console.error("createMarketTxResult:", createMarketTxResult);
      throw new Error("createMarketTxResult failed");
    }

    // Send transaction to go live
    const goLiveSignature = await sendAndConfirmTransaction(this.client.connection, goLiveTransaction, [args.user], {
      skipPreflight: true,
      commitment: "confirmed",
    });
    console.log("go live signature:", goLiveSignature);

    // Check go live succeeded
    const { blockhash: blockhash1, lastValidBlockHeight: lastValidBlockHeight1 } =
      await this.client.connection.getLatestBlockhash("confirmed");
    const goLiveTxResult = await this.client.connection.confirmTransaction(
      {
        signature: goLiveSignature,
        blockhash: blockhash1,
        lastValidBlockHeight: lastValidBlockHeight1,
      },
      "confirmed",
    );

    if (goLiveTxResult.value.err) {
      console.error("goLiveTxResult:", goLiveTxResult);
      throw new Error("goLiveTxResult failed");
    }

    const stakingPoolInstance = await StakingPoolClient.fromStakingPoolId({
      client: this.client,
      poolAccountAddressId: stakingId,
    });

    const livePool = await LivePoolClient.fromAmmId(ammId, this.client);

    return [stakingPoolInstance, livePool];
  }

  public async fetchRelatedTickets() {
    return MemeTicketClient.fetchRelatedTickets(this.id, this.client);
  }

  public async getHoldersCount() {
    return BoundPoolClient.getHoldersCount(this.id, this.client);
  }

  public async getHoldersMap() {
    return BoundPoolClient.getHoldersMap(this.id, this.client);
  }

  public async getHoldersList() {
    return BoundPoolClient.getHoldersList(this.id, this.client);
  }

  /**
   * Fetches all unique token holders for pool and returns their number
   */
  public static async getHoldersCount(pool: PublicKey, client: MemechanClient) {
    return (await BoundPoolClient.getHoldersList(pool, client)).length;
  }

  public static async getHoldersMap(pool: PublicKey, client: MemechanClient) {
    const tickets = await MemeTicketClient.fetchRelatedTickets(pool, client);
    const uniqueHolders: Map<string, MemeTicketFields[]> = new Map();

    tickets.forEach((ticket) => {
      const addr = ticket.owner.toBase58();
      if (!uniqueHolders.has(addr)) {
        uniqueHolders.set(addr, []);
      }
      uniqueHolders.get(addr)?.push(ticket);
    });

    return uniqueHolders;
  }

  /**
   * Fetches all unique token holders for pool and returns thier addresses
   */
  public static async getHoldersList(pool: PublicKey, client: MemechanClient) {
    const holdersMap = await BoundPoolClient.getHoldersMap(pool, client);

    return Array.from(holdersMap.keys());
  }

  public static async getMemePrice({
    boundPoolInfo,
    quotePriceInUsd,
  }: {
    boundPoolInfo: BoundPool;
    quotePriceInUsd: number;
  }): Promise<{ priceInQuote: string; priceInUsd: string }> {
    const memeBalance = new BigNumber(boundPoolInfo.memeReserve.tokens.toString());
    const quoteBalance = new BigNumber(boundPoolInfo.quoteReserve.tokens.toString());

    const quoteBalanceConverted = quoteBalance.div(10 ** MEMECHAN_QUOTE_TOKEN_DECIMALS);
    const soldMemeConverted = new BigNumber(DEFAULT_MAX_M).minus(memeBalance).div(10 ** MEMECHAN_MEME_TOKEN_DECIMALS);

    // In case no meme coins were sold, return 0-prices
    if (soldMemeConverted.eq(0)) {
      return { priceInQuote: "0", priceInUsd: "0" };
    }

    const memePriceInQuote = quoteBalanceConverted.div(soldMemeConverted);
    const memePriceInUsd = memePriceInQuote.multipliedBy(quotePriceInUsd).toString();

    return { priceInQuote: memePriceInQuote.toString(), priceInUsd: memePriceInUsd };
  }

  public static getMemeMarketCap({ memePriceInUsd }: { memePriceInUsd: string }): string {
    const marketCap = new BigNumber(FULL_MEME_AMOUNT_CONVERTED).multipliedBy(memePriceInUsd).toString();

    return marketCap;
  }

  static getATAAddress(owner: PublicKey, mint: PublicKey, programId: PublicKey) {
    return findProgramAddress([owner.toBuffer(), programId.toBuffer(), mint.toBuffer()], new PublicKey(ATA_PROGRAM_ID));
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
