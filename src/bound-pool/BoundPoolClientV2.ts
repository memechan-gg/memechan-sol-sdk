import { Token } from "@raydium-io/raydium-sdk";
import { TOKEN_PROGRAM_ID, getOrCreateAssociatedTokenAccount, mintTo } from "@solana/spl-token";
import {
  ComputeBudgetProgram,
  Connection,
  GetProgramAccountsFilter,
  Keypair,
  PublicKey,
  SYSVAR_CLOCK_PUBKEY,
  SYSVAR_RENT_PUBKEY,
  Signer,
  SystemProgram,
  Transaction,
  sendAndConfirmTransaction,
} from "@solana/web3.js";
import BigNumber from "bignumber.js";
import {
  BoundPool,
  BoundPoolFields,
  BoundPool as CodegenBoundPool,
  MemeTicketFields,
} from "../schema/v2/codegen/accounts";

import { BN, Program, Provider } from "@coral-xyz/anchor";
import { ATA_PROGRAM_ID, PROGRAMIDS } from "../raydium/config";
import { StakingPoolClient } from "../staking-pool/StakingPoolClient";
import {
  BoundPoolArgsV2,
  BoundPoolWithBuyMemeArgsV2,
  BuyMemeArgs,
  GetBuyMemeTransactionArgs,
  GetBuyMemeTransactionOutput,
  GetBuyMemeTransactionStaticArgsV2,
  GetCreateNewBondingPoolAndTokenWithBuyMemeTransactionArgsV2,
  GetInitStakingPoolTransactionArgsV2,
  GetOutputAmountForBuyMeme,
  GetOutputAmountForSellMemeArgs,
  GetSellMemeTransactionArgs,
  GetSellMemeTransactionArgsLegacy,
  GetSellMemeTransactionOutput,
  InitStakingPoolArgsV2,
  InitStakingPoolResultV2,
  SellMemeArgs,
  SwapXArgs,
  SwapYArgs,
} from "./types";

import { findProgramAddress } from "../common/helpers";
import {
  COMPUTE_UNIT_PRICE,
  DEFAULT_MAX_M,
  FULL_MEME_AMOUNT_CONVERTED,
  MEMECHAN_FEE_WALLET_ID,
  MEMECHAN_MEME_TOKEN_DECIMALS,
  TOKEN_INFOS,
} from "../config/config";
import { MemechanSol } from "../schema/v2/types/memechan_sol";
import { getCreateMintWithPriorityTransaction } from "../token/getCreateMintWithPriorityTransaction";
import { NewBPInstructionParsed } from "../tx-parsing/v2/parsers/bonding-pool-creation-parser";
import { getTxSize } from "../util/get-tx-size";
import { getSendAndConfirmTransactionMethod } from "../util/getSendAndConfirmTransactionMethod";
import { retry } from "../util/retry";
import { deductSlippage } from "../util/trading/deductSlippage";
import { extractSwapDataFromSimulation } from "../util/trading/extractSwapDataFromSimulation";
import { getOptimizedTransactions } from "../memeticket/utils";
import { ParsedMemeTicket } from "../memeticket/types";
import { normalizeInputCoinAmount } from "../util/trading/normalizeInputCoinAmount";
import base58 from "bs58";
import { ensureAssociatedTokenAccountWithIX } from "../util/ensureAssociatedTokenAccountWithIX";
import { NoBoundPoolExist } from "./errors";
import { getTokenInfoByMint } from "../config/helpers";
import { addWrapSOLInstructionIfNativeMint } from "../util/addWrapSOLInstructionIfNativeMint";
import { addUnwrapSOLInstructionIfNativeMint } from "../util/addUnwrapSOLInstructionIfNativeMint";
import { TokenInfo } from "../config/types";
import { MemechanClientV2 } from "../MemechanClientV2";
import { MemeTicketClientV2 } from "../memeticket/MemeTicketClientV2";
import { parseTxV2 } from "../tx-parsing/v2/parsingV2";
import { getCreateMetadataTransactionV2 } from "../token/createMetadataV2";

export class BoundPoolClientV2 {
  private constructor(
    public id: PublicKey,
    public client: MemechanClientV2,
    public memeVault: PublicKey,
    public quoteVault: PublicKey,
    public memeTokenMint: PublicKey,
    public quoteTokenMint: PublicKey = TOKEN_INFOS.WSOL.mint,
    public memeToken: Token,
    public poolObjectData: BoundPool,
  ) {
    //
  }

  public static async fromBoundPoolId({
    client,
    poolAccountAddressId,
  }: {
    client: MemechanClientV2;
    poolAccountAddressId: PublicKey;
  }) {
    const poolObjectData = await BoundPoolClientV2.fetch2(client.connection, poolAccountAddressId);

    const boundClientInstance = new BoundPoolClientV2(
      poolAccountAddressId,
      client,
      poolObjectData.memeReserve.vault,
      poolObjectData.quoteReserve.vault,
      poolObjectData.memeReserve.mint,
      poolObjectData.quoteReserve.mint,
      new Token(TOKEN_PROGRAM_ID, poolObjectData.memeReserve.mint, MEMECHAN_MEME_TOKEN_DECIMALS),
      poolObjectData,
    );

    return boundClientInstance;
  }

  public static async fromPoolCreationTransaction({
    client,
    poolCreationSignature,
  }: {
    client: MemechanClientV2;
    poolCreationSignature: string;
  }) {
    const parsedData = await parseTxV2(poolCreationSignature, client);
    console.debug("parsedData: ", parsedData);

    if (!parsedData) {
      throw new Error(`No such pool found for such signature ${poolCreationSignature}`);
    }

    const newPoolInstructionData = parsedData.find((el): el is NewBPInstructionParsed => el.type === "new_pool");

    if (!newPoolInstructionData) {
      throw new Error(`No such pool found in instruction data for signature ${poolCreationSignature}`);
    }

    const poolObjectData = await BoundPoolClientV2.fetch2(client.connection, newPoolInstructionData.poolAddr);

    const boundClientInstance = new BoundPoolClientV2(
      newPoolInstructionData.poolAddr,
      client,
      poolObjectData.memeReserve.vault,
      poolObjectData.quoteReserve.vault,
      poolObjectData.memeReserve.mint,
      poolObjectData.quoteReserve.mint,
      new Token(TOKEN_PROGRAM_ID, poolObjectData.memeReserve.mint, MEMECHAN_MEME_TOKEN_DECIMALS),
      poolObjectData,
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

  public static async getCreateNewBondingPoolAndBuyAndTokenWithBuyMemeTransaction(
    args: GetCreateNewBondingPoolAndTokenWithBuyMemeTransactionArgsV2,
  ): Promise<{
    createPoolTransaction: Transaction;
    memeMintKeypair: Keypair;
    poolQuoteVault: PublicKey;
    launchVault: PublicKey;
    memeTicketPublicKey?: PublicKey;
  }> {
    const {
      payer,
      client,
      quoteToken,
      transaction: createPoolTransaction = new Transaction(),
      feeQuoteVaultPk,
      tokenMetadata,
    } = args;
    const { connection, memechanProgram } = client;

    const memeMintKeypair = Keypair.generate();
    const memeMint = memeMintKeypair.publicKey;
    const id = this.findBoundPoolPda(memeMintKeypair.publicKey, quoteToken.mint, args.client.memechanProgram.programId);
    const poolSigner = BoundPoolClientV2.findSignerPda(id, args.client.memechanProgram.programId);

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

    let feeQuoteVault: PublicKey | undefined = feeQuoteVaultPk;

    // If `feeQuoteVaultPk` is not passed in args, we need to find out, whether a quote account for an admin
    // already exists
    if (!feeQuoteVault) {
      feeQuoteVault = await ensureAssociatedTokenAccountWithIX({
        connection,
        payer,
        mint: quoteToken.mint,
        owner: new PublicKey(MEMECHAN_FEE_WALLET_ID),
        transaction: createPoolTransaction,
      });
    }

    const poolQuoteVault = await ensureAssociatedTokenAccountWithIX({
      connection,
      payer,
      mint: quoteToken.mint,
      owner: poolSigner,
      transaction: createPoolTransaction,
    });

    const launchVault = await ensureAssociatedTokenAccountWithIX({
      connection,
      payer,
      mint: memeMint,
      owner: poolSigner,
      transaction: createPoolTransaction,
    });

    const quoteInfo = getTokenInfoByMint(quoteToken.mint);

    const createPoolInstruction = await memechanProgram.methods
      .newPool()
      .accounts({
        feeQuoteVault: feeQuoteVault,
        memeVault: launchVault,
        quoteVault: poolQuoteVault,
        memeMint: memeMint,
        pool: id,
        poolSigner: poolSigner,
        sender: payer,
        quoteMint: quoteToken.mint,
        tokenProgram: TOKEN_PROGRAM_ID,
        systemProgram: SystemProgram.programId,
        targetConfig: quoteInfo.targetConfigV2,
      })
      .instruction();

    createPoolTransaction.add(createPoolInstruction);

    let memeTicketPublicKey: PublicKey | undefined = undefined;
    if (args.buyMemeTransactionArgs) {
      const inputAmount = new BigNumber(args.buyMemeTransactionArgs.inputAmount);
      if (inputAmount.isGreaterThan(0)) {
        const { tx, memeTicketPublicKey: newMemeTicketPublicKey } = await this.getBuyMemeTransaction({
          ...args.buyMemeTransactionArgs,
          boundPoolId: id,
          poolSignerPda: poolSigner,
          client,
          quoteVault: poolQuoteVault,
          quoteMint: quoteToken.mint,
        });
        memeTicketPublicKey = newMemeTicketPublicKey;
        createPoolTransaction.add(tx);
      }
    }

    const createTokenInstructions = (
      await getCreateMetadataTransactionV2(client, {
        payer,
        mint: memeMint,
        poolSigner,
        poolId: id,
        metadata: tokenMetadata,
      })
    ).instructions;

    createPoolTransaction.add(...createTokenInstructions);

    return {
      createPoolTransaction,
      memeMintKeypair,
      poolQuoteVault,
      launchVault,
      memeTicketPublicKey,
    };
  }

  public static async new(args: BoundPoolArgsV2): Promise<BoundPoolClientV2> {
    const { payer } = args;
    const tokenInfo = getTokenInfoByMint(args.quoteToken.mint);
    return await this.newWithBuyTx({
      ...args,
      targetConfig: tokenInfo.targetConfigV2,
      buyMemeTransactionArgs: {
        inputAmount: "0",
        minOutputAmount: "0",
        slippagePercentage: 0,
        user: payer.publicKey,
        memeTicketNumber: 1,
      },
    });
  }

  public static async newWithBuyTx(args: BoundPoolWithBuyMemeArgsV2): Promise<BoundPoolClientV2> {
    const { payer, client, quoteToken } = args;
    const { memechanProgram } = client;

    const { createPoolTransaction, memeMintKeypair, poolQuoteVault, launchVault } =
      await this.getCreateNewBondingPoolAndBuyAndTokenWithBuyMemeTransaction({
        ...args,
        payer: payer.publicKey,
      });

    const memeMint = memeMintKeypair.publicKey;

    const createPoolTransactionSize = getTxSize(createPoolTransaction, payer.publicKey);
    console.debug("createPoolTransaction size: ", createPoolTransactionSize);

    const signers = [payer, memeMintKeypair];

    const createPoolMethod = getSendAndConfirmTransactionMethod({
      connection: client.connection,
      transaction: createPoolTransaction,
      signers,
      options: {
        commitment: "confirmed",
        skipPreflight: true,
        preflightCommitment: "confirmed",
      },
    });

    await retry({
      fn: createPoolMethod,
      functionName: "createPoolMethod",
      retries: 1,
    });

    const id = this.findBoundPoolPda(memeMint, quoteToken.mint, memechanProgram.programId);
    const poolObjectData = await BoundPoolClientV2.fetch2(client.connection, id);

    return new BoundPoolClientV2(
      id,
      client,
      launchVault,
      poolQuoteVault,
      memeMint,
      quoteToken.mint,
      new Token(TOKEN_PROGRAM_ID, memeMint, MEMECHAN_MEME_TOKEN_DECIMALS),
      poolObjectData,
    );
  }

  public static async getOutputAmountForNewPoolWithBuyMemeTx(args: BoundPoolWithBuyMemeArgsV2): Promise<string> {
    const { payer, client } = args;

    const { createPoolTransaction, memeMintKeypair } =
      await this.getCreateNewBondingPoolAndBuyAndTokenWithBuyMemeTransaction({
        ...args,
        payer: payer.publicKey,
      });

    const signers = [payer, memeMintKeypair, client.simulationKeypair];
    const result = await client.connection.simulateTransaction(createPoolTransaction, signers, true);

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
    const outputAmountRespectingSlippage = deductSlippage(outputAmount, args.buyMemeTransactionArgs.slippagePercentage);

    return outputAmountRespectingSlippage.toString();
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
      throw new NoBoundPoolExist(`[BoundPoolClientV2.fetch] No account info found for the pool ${accountId}`);
    }

    return accountInfo;
  }

  public static async all(
    program: Program<MemechanSol>,
  ): Promise<{ account: BoundPoolFields; publicKey: PublicKey }[]> {
    const rawPools = await program.account.boundPool.all();
    const pools = rawPools.map((el) => el);

    return pools;
  }

  public static async allLocked(
    program: Program<MemechanSol>,
  ): Promise<{ account: BoundPoolFields; publicKey: PublicKey }[]> {
    const filters: GetProgramAccountsFilter[] = [
      {
        memcmp: {
          bytes: base58.encode(Buffer.from([0x1])),
          offset: 352,
        },
      },
    ];
    const pools = await program.account.boundPool.all(filters);
    return pools;
  }

  public findSignerPda(): PublicKey {
    return BoundPoolClientV2.findSignerPda(this.id, this.client.memechanProgram.programId);
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

  public async swapY(input: SwapYArgs): Promise<MemeTicketClientV2> {
    // const id = Keypair.generate();
    const user = input.user!;
    const payer = input.payer!;
    const memeTicketNumber = input.memeTicketNumber!;

    const pool = input.pool ?? this.id;
    const poolSignerPda = BoundPoolClientV2.findSignerPda(pool, this.client.memechanProgram.programId);
    const solIn = input.quoteAmountIn;
    const memeOut = input.memeTokensOut;

    const memeTicketPublicKey = MemeTicketClientV2.getMemeTicketPDA({
      ticketNumber: memeTicketNumber,
      poolId: pool,
      userId: user.publicKey,
    });

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

    console.log("solIn: ", solIn);
    console.log("memeOut: ", memeOut);

    await this.client.memechanProgram.methods
      .swapY(new BN(solIn), new BN(memeOut), new BN(memeTicketNumber))
      .accounts({
        memeTicket: memeTicketPublicKey,
        owner: user.publicKey,
        pool: pool,
        poolSignerPda: poolSignerPda,
        quoteVault: this.quoteVault,
        userSol: userQuoteAcc,
        systemProgram: SystemProgram.programId,
        tokenProgram: TOKEN_PROGRAM_ID,
      })
      .signers([user])
      .rpc({ skipPreflight: true, commitment: "confirmed", preflightCommitment: "confirmed" });

    return new MemeTicketClientV2(memeTicketPublicKey, this.client);
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
    const { tx } = await this.getBuyMemeTransaction(input);

    const txMethod = getSendAndConfirmTransactionMethod({
      connection: this.client.connection,
      transaction: tx,
      signers: [input.signer],
    });

    return await txMethod();
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
    const {
      inputAmount,
      minOutputAmount,
      slippagePercentage,
      user,
      transaction = new Transaction(),
      memeTicketNumber,
    } = input;
    let { inputTokenAccount } = input;

    const pool = this.id;
    const poolSignerPda = this.findSignerPda();
    const ticketNumberBN = new BN(memeTicketNumber);

    const memeTicketPublicKey = MemeTicketClientV2.getMemeTicketPDA({
      ticketNumber: memeTicketNumber,
      poolId: pool,
      userId: user,
    });
    const connection = this.client.connection;

    // input
    const quoteInfo = getTokenInfoByMint(this.quoteTokenMint);

    const inputAmountWithDecimals = normalizeInputCoinAmount(inputAmount, quoteInfo.decimals);
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
      inputTokenAccount = await ensureAssociatedTokenAccountWithIX({
        connection: connection,
        payer: user,
        mint: this.quoteTokenMint,
        owner: user,
        transaction,
      });
    }

    addWrapSOLInstructionIfNativeMint(this.quoteTokenMint, user, inputTokenAccount, inputAmountBN, transaction);

    const buyMemeInstruction = await this.client.memechanProgram.methods
      .swapY(inputAmountBN, minOutputBN, ticketNumberBN)
      .accounts({
        owner: user,
        pool: pool,
        poolSignerPda: poolSignerPda,
        quoteVault: this.quoteVault,
        userSol: inputTokenAccount,
        systemProgram: SystemProgram.programId,
        tokenProgram: TOKEN_PROGRAM_ID,
        memeTicket: memeTicketPublicKey,
      })
      .instruction();

    const addPriorityFee = ComputeBudgetProgram.setComputeUnitPrice({
      microLamports: COMPUTE_UNIT_PRICE,
    });

    transaction.add(addPriorityFee);
    transaction.add(buyMemeInstruction);
    addUnwrapSOLInstructionIfNativeMint(this.quoteTokenMint, user, transaction); // unwrap if we get back some change

    return { tx: transaction, memeTicketPublicKey, inputTokenAccount };
  }

  /**
   * Generates a transaction to buy a meme.
   *
   * @param {GetBuyMemeTransactionStaticArgsV2} input - The input arguments required for the transaction.
   * @returns {Promise<GetBuyMemeTransactionOutput>} A promise that resolves to the transaction object.
   *
   * @work-in-progress This method is a work in progress and not yet ready for production use.
   * @untested This method is untested and may contain bugs.
   */
  public static async getBuyMemeTransaction(
    input: GetBuyMemeTransactionStaticArgsV2,
  ): Promise<GetBuyMemeTransactionOutput> {
    const {
      inputAmount,
      minOutputAmount,
      slippagePercentage,
      user,
      transaction = new Transaction(),
      boundPoolId,
      poolSignerPda,
      quoteVault,
      client,
      memeTicketNumber,
      quoteMint,
    } = input;
    let { inputTokenAccount } = input;

    const pool = boundPoolId;
    const ticketNumberBN = new BN(memeTicketNumber);
    const memeTicketPublicKey = MemeTicketClientV2.getMemeTicketPDA({
      ticketNumber: memeTicketNumber,
      poolId: pool,
      userId: user,
    });

    // input
    const quoteInfo = getTokenInfoByMint(quoteMint);
    const inputAmountWithDecimals = normalizeInputCoinAmount(inputAmount, quoteInfo.decimals);
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
      inputTokenAccount = await ensureAssociatedTokenAccountWithIX({
        connection: client.connection,
        payer: user,
        mint: quoteMint,
        owner: user,
        transaction,
      });
    }
    addWrapSOLInstructionIfNativeMint(quoteMint, user, inputTokenAccount, inputAmountBN, transaction);

    const buyMemeInstruction = await client.memechanProgram.methods
      .swapY(inputAmountBN, minOutputBN, ticketNumberBN)
      .accounts({
        memeTicket: memeTicketPublicKey,
        owner: user,
        pool: pool,
        poolSignerPda: poolSignerPda,
        quoteVault: quoteVault,
        userSol: inputTokenAccount,
        systemProgram: SystemProgram.programId,
        tokenProgram: TOKEN_PROGRAM_ID,
      })
      .instruction();

    transaction.add(buyMemeInstruction);

    return { tx: transaction, memeTicketPublicKey, inputTokenAccount };
  }

  // TODO(?): Handle for 0 input
  // TODO(?): Handle for very huge number
  public async getOutputAmountForBuyMeme(input: GetOutputAmountForBuyMeme) {
    const { inputAmount, slippagePercentage, transaction = new Transaction() } = input;
    const pool = this.id;

    // input & output
    const quoteInfo = getTokenInfoByMint(this.quoteTokenMint);
    const inputAmountWithDecimals = normalizeInputCoinAmount(inputAmount, quoteInfo.decimals);
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
      const latestBlockhash = await this.client.connection.getLatestBlockhash("confirmed");
      tx.recentBlockhash = latestBlockhash.blockhash;
      tx.lastValidBlockHeight = latestBlockhash.lastValidBlockHeight;

      const signature = await sendAndConfirmTransaction(this.client.connection, tx, [input.signer], {
        commitment: "confirmed",
        skipPreflight: true,
        preflightCommitment: "confirmed",
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
    const { availableAmountWithDecimals, tickets } = await MemeTicketClientV2.fetchAvailableTicketsByUser2(
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

    const quoteInfo = getTokenInfoByMint(this.quoteTokenMint);

    // output
    // Note: Be aware, we relay on the fact that `MEMECHAN_QUOTE_TOKEN_DECIMALS`
    // would be always set same for all memecoins
    // As well as the fact that memecoins and tickets decimals are always the same
    const minOutputWithSlippage = deductSlippage(new BigNumber(minOutputAmount), slippagePercentage);
    const minOutputNormalized = normalizeInputCoinAmount(minOutputWithSlippage.toString(), quoteInfo.decimals);
    const minOutputBN = new BN(minOutputNormalized.toString());

    // If `outputTokenAccount` is not passed in args, we need to find out, whether a outputTokenAccount exists for user
    if (!outputTokenAccount) {
      outputTokenAccount = await ensureAssociatedTokenAccountWithIX({
        connection: connection,
        payer: user,
        mint: this.quoteTokenMint,
        owner: user,
        transaction,
      });
    }

    const { ticketsRequiredToSell, isMoreThanOneTicket } = await MemeTicketClientV2.getRequiredTicketsToSell({
      amount: inputAmountBignumber,
      availableTickets: tickets,
    });

    // TODO: We need to close tickets if there is no money left in the ticket
    let destinationTicket: ParsedMemeTicket;
    if (isMoreThanOneTicket) {
      const [destinationTicketRaw, ...ticketsToMerge] = ticketsRequiredToSell;
      destinationTicket = destinationTicketRaw;
      const destinationMemeticketInstance = new MemeTicketClientV2(destinationTicketRaw.id, this.client);

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

    addUnwrapSOLInstructionIfNativeMint(this.quoteTokenMint, user, transaction);

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

    const quoteInfo = getTokenInfoByMint(this.quoteTokenMint);

    // output
    // Note: Be aware, we relay on the fact that `MEMECOIN_DECIMALS` would be always set same for all memecoins
    // As well as the fact that memecoins and tickets decimals are always the same
    const outputAmount = new BigNumber(swapOutAmount).div(10 ** quoteInfo.decimals);
    const outputAmountRespectingSlippage = deductSlippage(outputAmount, slippagePercentage);

    return outputAmountRespectingSlippage.toString();
  }

  public async isMemeCoinReadyToLivePhase() {
    const poolData = await BoundPoolClientV2.fetch2(this.client.connection, this.id);
    const isPoolLocked = poolData.locked;

    return isPoolLocked;
  }

  public async swapX(input: SwapXArgs): Promise<string> {
    const sellMemeCoinTransaction = await this.getSellMemeTransactionLegacy(input);

    const txId = await sendAndConfirmTransaction(this.client.connection, sellMemeCoinTransaction, [input.user], {
      skipPreflight: true,
      commitment: "confirmed",
      preflightCommitment: "confirmed",
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

  public async getInitStakingPoolTransaction(input: GetInitStakingPoolTransactionArgsV2): Promise<{
    transaction: Transaction;
    stakingQuoteVault: PublicKey;
    stakingMemeVault: PublicKey;
    stakingChanVault: PublicKey;
  }> {
    const { user, payer, pool = this.id, boundPoolInfo } = input;
    const tx = input.transaction ?? new Transaction();

    const stakingId = BoundPoolClientV2.findStakingPda(
      boundPoolInfo.memeReserve.mint,
      this.client.memechanProgram.programId,
    );
    const stakingSigner = StakingPoolClient.findSignerPda(stakingId, this.client.memechanProgram.programId);
    const adminTicketId = BoundPoolClientV2.findMemeTicketPda(stakingId, this.client.memechanProgram.programId);
    const stakingQuoteVault = await ensureAssociatedTokenAccountWithIX({
      connection: this.client.connection,
      payer: payer.publicKey,
      mint: boundPoolInfo.quoteReserve.mint,
      owner: stakingSigner,
      transaction: tx,
    });

    const stakingMemeVault = await ensureAssociatedTokenAccountWithIX({
      connection: this.client.connection,
      payer: payer.publicKey,
      mint: boundPoolInfo.memeReserve.mint,
      owner: stakingSigner,
      transaction: tx,
    });

    const stakingChanVault = await ensureAssociatedTokenAccountWithIX({
      connection: this.client.connection,
      payer: payer.publicKey,
      mint: TOKEN_INFOS.CHAN.mint,
      owner: stakingSigner,
      transaction: tx,
    });

    const methodArgs = {
      pool,
      signer: user,
      boundPoolSignerPda: this.findSignerPda(),
      memeTicket: adminTicketId,
      poolMemeVault: boundPoolInfo.memeReserve.vault,
      poolQuoteVault: boundPoolInfo.quoteReserve.vault,
      stakingMemeVault,
      stakingQuoteVault: stakingQuoteVault,
      stakingChanVault: stakingChanVault,
      quoteMint: this.quoteTokenMint,
      staking: stakingId,
      stakingPoolSignerPda: stakingSigner,
      feeVaultQuote: boundPoolInfo.feeVaultQuote,
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

    return { transaction: tx, stakingMemeVault, stakingQuoteVault, stakingChanVault };
  }

  public async initStakingPool(input: InitStakingPoolArgsV2): Promise<InitStakingPoolResultV2> {
    const { transaction, stakingMemeVault, stakingQuoteVault, stakingChanVault } =
      await this.getInitStakingPoolTransaction({
        ...input,
        user: input.user.publicKey,
      });

    const signAndConfirmInitStakingPoolTransaction = getSendAndConfirmTransactionMethod({
      connection: this.client.connection,
      transaction,
      signers: [input.user],
    });

    await retry({
      fn: signAndConfirmInitStakingPoolTransaction,
      functionName: "initStakingPool",
    });

    return { stakingMemeVault, stakingQuoteVault, stakingChanVault };
  }

  // public async getGoLiveTransaction(args: GetGoLiveTransactionArgs): Promise<{
  //   createMarketTransactions: (Transaction | VersionedTransaction)[];
  //   goLiveTransaction: Transaction;
  //   stakingId: PublicKey;
  //   ammId: PublicKey;
  // }> {
  //   return await BoundPoolClientV2.getGoLiveTransaction({
  //     ...args,
  //     client: this.client,
  //     memeMint: args.boundPoolInfo.memeReserve.mint,
  //     transaction: new Transaction(),
  //     payer: args.user,
  //     quoteMint: args.boundPoolInfo.quoteReserve.mint,
  //   });
  // }

  // public static async getGoLiveTransaction(args: GetGoLiveTransactionStaticArgs): Promise<{
  //   createMarketTransactions: (Transaction | VersionedTransaction)[];
  //   goLiveTransaction: Transaction;
  //   stakingId: PublicKey;
  //   marketId: PublicKey;
  //   ammId: PublicKey;
  // }> {
  //   const {
  //     client,
  //     memeMint,
  //     user,
  //     // feeDestinationWalletAddress,
  //     // memeVault,
  //     // quoteVault,
  //     transaction = new Transaction(),
  //     quoteMint,
  //   } = args;
  //   const stakingId = BoundPoolClientV2.findStakingPda(memeMint, client.memechanProgram.programId);
  //   // const stakingSigner = StakingPoolClient.findSignerPda(stakingId, client.memechanProgram.programId);
  //   const baseTokenInfo = new Token(TOKEN_PROGRAM_ID, memeMint, MEMECHAN_MEME_TOKEN_DECIMALS);

  //   const quoteTokenInfo = getTokenInfoByMint(quoteMint);

  //   // TODO: Put all the transactions into one (now they exceed trx size limit)
  //   const { marketId, transactions: createMarketTransactions } = await getCreateMarketTransactions({
  //     baseToken: baseTokenInfo,
  //     quoteToken: quoteTokenInfo,
  //     marketIdSeed: stakingId,
  //     wallet: user.publicKey,
  //     signer: user,
  //     connection: client.connection,
  //   });

  //   // console.log("stakingId: ", stakingId.toBase58());
  //   // console.log("createMarketTransaction marketId 0: ", marketId);

  //   // // const createMarketInstructions = getCreateMarketInstructions(transactions);
  //   // // createMarketTransaction.add(...createMarketInstructions);

  //   // transaction.add(
  //   //   SystemProgram.transfer({
  //   //     fromPubkey: user.publicKey,
  //   //     toPubkey: stakingSigner,
  //   //     lamports: RAYDIUM_PROTOCOL_FEE + TRANSFER_FEE,
  //   //   }),
  //   // );

  //   // console.log("setComputeUnitLimit");

  //   // const modifyComputeUnits = ComputeBudgetProgram.setComputeUnitLimit({
  //   //   units: 250000,
  //   // });

  //   // transaction.add(modifyComputeUnits);

  //   // console.log("setComputeUnitPrice");

  //   // const addPriorityFee = ComputeBudgetProgram.setComputeUnitPrice({
  //   //   microLamports: COMPUTE_UNIT_PRICE * 100, // we need high priority, we can always optimize later
  //   // });

  //   // transaction.add(addPriorityFee);

  //   // const feeDestination = new PublicKey(feeDestinationWalletAddress);
  //   // console.log("feeDestination: ", feeDestination.toBase58());
  //   const ammId = BoundPoolClientV2.getAssociatedId({ programId: PROGRAMIDS.AmmV4, marketId });
  //   // console.log("ammId: ", ammId.toBase58());
  //   // const raydiumAmmAuthority = BoundPoolClientV2.getAssociatedAuthority({ programId: PROGRAMIDS.AmmV4 });
  //   // console.log("raydiumAmmAuthority: ", raydiumAmmAuthority.publicKey.toBase58());
  //   // const openOrders = BoundPoolClientV2.getAssociatedOpenOrders({ programId: PROGRAMIDS.AmmV4, marketId });
  //   // console.log("openOrders: ", openOrders.toBase58());
  //   // const targetOrders = BoundPoolClientV2.getAssociatedTargetOrders({ programId: PROGRAMIDS.AmmV4, marketId });
  //   // console.log("targetOrders: ", targetOrders.toBase58());
  //   // const ammConfig = BoundPoolClientV2.getAssociatedConfigId({ programId: PROGRAMIDS.AmmV4 });
  //   // console.log("ammConfig: ", ammConfig.toBase58());
  //   // const raydiumLpMint = BoundPoolClientV2.getAssociatedLpMint({ programId: PROGRAMIDS.AmmV4, marketId });
  //   // console.log("raydiumLpMint: ", raydiumLpMint.toBase58());
  //   // const raydiumMemeVault = BoundPoolClientV2.getAssociatedBaseVault({ programId: PROGRAMIDS.AmmV4, marketId });
  //   // console.log("raydiumMemeVault: ", raydiumMemeVault.toBase58());
  //   // const raydiumWsolVault = BoundPoolClientV2.getAssociatedQuoteVault({ programId: PROGRAMIDS.AmmV4, marketId });
  //   // console.log("raydiumWsolVault: ", raydiumWsolVault.toBase58());

  //   // const userDestinationLpTokenAta = BoundPoolClientV2.getATAAddress(
  //   //   stakingSigner,
  //   //   raydiumLpMint,
  //   //   TOKEN_PROGRAM_ID,
  //   // ).publicKey;

  //   // console.log("userDestinationLpTokenAta. : " + userDestinationLpTokenAta.toBase58());

  //   // const goLiveInstruction = await client.memechanProgram.methods
  //   //   .goLive(raydiumAmmAuthority.nonce)
  //   //   .accounts({
  //   //     signer: user.publicKey,
  //   //     poolMemeVault: memeVault,
  //   //     poolQuoteVault: quoteVault,
  //   //     quoteMint: quoteMint,
  //   //     staking: stakingId,
  //   //     stakingPoolSignerPda: stakingSigner,
  //   //     raydiumLpMint: raydiumLpMint,
  //   //     raydiumAmm: ammId,
  //   //     raydiumAmmAuthority: raydiumAmmAuthority.publicKey,
  //   //     raydiumMemeVault: raydiumMemeVault,
  //   //     raydiumQuoteVault: raydiumWsolVault,
  //   //     marketProgramId: PROGRAMIDS.OPENBOOK_MARKET,
  //   //     systemProgram: SystemProgram.programId,
  //   //     tokenProgram: TOKEN_PROGRAM_ID,
  //   //     marketAccount: marketId,
  //   //     clock: SYSVAR_CLOCK_PUBKEY,
  //   //     rent: SYSVAR_RENT_PUBKEY,
  //   //     openOrders: openOrders,
  //   //     targetOrders: targetOrders,
  //   //     memeMint: memeMint,
  //   //     ammConfig: ammConfig,
  //   //     ataProgram: ATA_PROGRAM_ID,
  //   //     feeDestinationInfo: feeDestination,
  //   //     userDestinationLpTokenAta: userDestinationLpTokenAta,
  //   //     raydiumProgram: PROGRAMIDS.AmmV4,
  //   //   })
  //   //   .instruction();

  //   // console.log("goLiveInstruction: ", goLiveInstruction);

  //   // transaction.add(goLiveInstruction);

  //   return { createMarketTransactions, goLiveTransaction: transaction, stakingId, ammId, marketId };
  // }

  // public async goLive(args: GoLiveArgs): Promise<[StakingPoolClient, LivePoolClient]> {
  //   return await BoundPoolClientV2.goLive({
  //     ...args,
  //     client: this.client,
  //     memeMint: this.memeTokenMint,
  //     quoteMint: this.quoteTokenMint,
  //   });
  // }

  // public static async goLive(args: GoLiveStaticArgs): Promise<[StakingPoolClient, LivePoolClient]> {
  //   return await retry({
  //     fn: () => BoundPoolClientV2.goLiveInternal(args),
  //     functionName: "goLiveStatic",
  //     retries: 3,
  //   });
  // }

  // private static async goLiveInternal(args: GoLiveStaticArgs): Promise<[StakingPoolClient, LivePoolClient]> {
  //   const client = args.client;
  //   // Get needed transactions
  //   const { createMarketTransactions, goLiveTransaction, stakingId, ammId, marketId } =
  //     await BoundPoolClientV2.getGoLiveTransaction(args);

  //   // check if market already exists
  //   console.log("marketId we try fetch: ", marketId.toBase58());
  //   const marketAccount = await client.connection.getAccountInfo(marketId, {
  //     commitment: "confirmed",
  //     dataSlice: { length: 0, offset: 0 },
  //   });
  //   console.log("marketAccount: ", marketAccount);

  //   // Send transaction to create market if not
  //   if (!marketAccount) {
  //     console.log("no market account exists yet, creating sending create market transactions");
  //     const createMarketSignatures = await sendTx(client.connection, args.user, createMarketTransactions, {
  //       skipPreflight: true,
  //       preflightCommitment: "confirmed",
  //     });
  //     console.log("create market signatures:", JSON.stringify(createMarketSignatures));

  //     // TODO we migh need this
  //     // Check market is created successfully
  //     const { blockhash, lastValidBlockHeight } = await client.connection.getLatestBlockhash("confirmed");
  //     const createMarketTxResult = await client.connection.confirmTransaction(
  //       {
  //         signature: createMarketSignatures[2], // wait for 3rd tx
  //         blockhash: blockhash,
  //         lastValidBlockHeight: lastValidBlockHeight,
  //       },
  //       "confirmed",
  //     );

  //     if (createMarketTxResult.value.err) {
  //       console.error("createMarketTxResult:", createMarketTxResult);
  //       throw new Error("createMarketTxResult failed");
  //     }
  //   }

  //   console.log("send go live transaction");
  //   // Send transaction to go live
  //   const goLiveSignature = await sendAndConfirmTransaction(client.connection, goLiveTransaction, [args.user], {
  //     skipPreflight: true,
  //     preflightCommitment: "confirmed",
  //     commitment: "confirmed",
  //   });
  //   console.log("go live signature:", goLiveSignature);

  //   // Check go live succeeded
  //   const { blockhash: blockhash1, lastValidBlockHeight: lastValidBlockHeight1 } =
  //     await client.connection.getLatestBlockhash("confirmed");
  //   const goLiveTxResult = await client.connection.confirmTransaction(
  //     {
  //       signature: goLiveSignature,
  //       blockhash: blockhash1,
  //       lastValidBlockHeight: lastValidBlockHeight1,
  //     },
  //     "confirmed",
  //   );

  //   if (goLiveTxResult.value.err) {
  //     console.error("goLiveTxResult:", goLiveTxResult);
  //     throw new Error("goLiveTxResult failed");
  //   }

  //   const stakingPoolInstance = await StakingPoolClient.fromStakingPoolId({
  //     client: client,
  //     poolAccountAddressId: stakingId,
  //   });

  //   const livePool = await LivePoolClient.fromAmmId(ammId, client);

  //   return [stakingPoolInstance, livePool];
  // }

  public async fetchRelatedTickets() {
    return MemeTicketClientV2.fetchRelatedTickets(this.id, this.client);
  }

  public async getHoldersCount() {
    return BoundPoolClientV2.getHoldersCount(this.id, this.client);
  }

  public async getHoldersMap() {
    return BoundPoolClientV2.getHoldersMap(this.id, this.client);
  }

  public async getHoldersList() {
    return BoundPoolClientV2.getHoldersList(this.id, this.client);
  }

  public getTokenInfo(): TokenInfo {
    return getTokenInfoByMint(this.quoteTokenMint);
  }

  /**
   * Fetches all unique token holders for pool and returns their number
   */
  public static async getHoldersCount(pool: PublicKey, client: MemechanClientV2) {
    return (await BoundPoolClientV2.getHoldersList(pool, client)).length;
  }

  public static async getHoldersMap(poolId: PublicKey, client: MemechanClientV2) {
    const tickets = await MemeTicketClientV2.fetchRelatedTickets(poolId, client);
    const uniqueHolders: Map<string, MemeTicketFields[]> = new Map();

    tickets.forEach((ticket) => {
      const addr = ticket.owner.toBase58();
      if (!uniqueHolders.has(addr)) {
        uniqueHolders.set(addr, []);
      }
      uniqueHolders.get(addr)?.push(ticket);
    });

    // can be null if called after go live
    const pool = await CodegenBoundPool.fetch(client.connection, poolId);

    if (pool) {
      // add bound pool as holder
      if (!uniqueHolders.has(MEMECHAN_FEE_WALLET_ID)) {
        const adminTicket = {
          amount: pool.adminFeesMeme,
          owner: new PublicKey(MEMECHAN_FEE_WALLET_ID),
          pool: poolId,
        } as MemeTicketFields;
        uniqueHolders.set(MEMECHAN_FEE_WALLET_ID, [adminTicket]);
      }
    }

    return uniqueHolders;
  }

  public static async getQuoteTokenDisplayName(poolAddress: PublicKey, connection: Connection) {
    const pool = await BoundPoolClientV2.fetch2(connection, poolAddress);
    const quoteToken = getTokenInfoByMint(pool.quoteReserve.mint);
    return quoteToken.displayName;
  }

  /**
   * Fetches all unique token holders for pool and returns thier addresses
   */
  public static async getHoldersList(pool: PublicKey, client: MemechanClientV2) {
    const holdersMap = await BoundPoolClientV2.getHoldersMap(pool, client);

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

    const quoteInfo = getTokenInfoByMint(boundPoolInfo.quoteReserve.mint);
    const quoteBalanceConverted = quoteBalance.div(10 ** quoteInfo.decimals);
    const soldMemeConverted = new BigNumber(DEFAULT_MAX_M).minus(memeBalance).div(10 ** MEMECHAN_MEME_TOKEN_DECIMALS);

    // In case no meme coins were sold, return 0-prices
    if (soldMemeConverted.eq(0)) {
      // TODO: ASAP IMPORTANT: DON'T GO WITH IT IN PROD
      const memePriceInQuote = new BigNumber(0.0000329053);
      const memePriceInUsd = memePriceInQuote.multipliedBy(quotePriceInUsd).toString();

      return { priceInQuote: memePriceInQuote.toString(), priceInUsd: memePriceInUsd };
    }

    const memePriceInQuote = quoteBalanceConverted.div(soldMemeConverted);
    const memePriceInUsd = memePriceInQuote.multipliedBy(quotePriceInUsd).toString();

    return { priceInQuote: memePriceInQuote.toString(), priceInUsd: memePriceInUsd };
  }

  /**
   * Get an initial meme price of a coin
   *   *
   * @work-in-progress This method is a work in progress and not yet ready for production use.
   * @untested This method is untested and may contain bugs.
   */
  public static async getInitialMemePrice({
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    boundPoolInfo,
    quotePriceInUsd,
  }: {
    boundPoolInfo: BoundPool;
    quotePriceInUsd: number;
  }): Promise<{ priceInQuote: string; priceInUsd: string }> {
    // TODO: ASAP IMPORTANT: DON'T GO WITH IT IN PROD
    const memePriceInQuote = new BigNumber(0.0000329053);
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
