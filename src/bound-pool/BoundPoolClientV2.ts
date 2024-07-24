import { METADATA_PROGRAM_ID, Token } from "@raydium-io/raydium-sdk";
import {
  AccountInfo,
  AddressLookupTableAccount,
  AddressLookupTableProgram,
  ComputeBudgetProgram,
  Connection,
  GetProgramAccountsFilter,
  Keypair,
  PublicKey,
  SYSVAR_RENT_PUBKEY,
  Signer,
  SystemProgram,
  Transaction,
  TransactionInstruction,
  TransactionMessage,
  VersionedTransaction,
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
import { ATA_PROGRAM_ID } from "../raydium/config";
import { StakingPoolClient } from "../staking-pool/StakingPoolClient";
import {
  BoundPoolArgsV2,
  BoundPoolWithBuyMemeArgsV2,
  BuyMemeArgs,
  GetBuyMemeTransactionArgs,
  GetBuyMemeTransactionOutput,
  GetBuyMemeTransactionStaticArgsV2,
  GetCreateNewBondingPoolAndTokenWithBuyMemeTransactionArgsV2,
  GetInitChanAmmPoolTransactionStaticArgs,
  GetInitChanPoolTransactionArgs,
  GetInitQuoteAmmPoolTransactionArgs,
  GetInitQuoteAmmPoolTransactionStaticArgs,
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
  TransferCreatorBonusChanFundsArgs,
} from "./types";

import { findProgramAddress, sleep } from "../common/helpers";
import {
  ADMIN_PUB_KEY,
  BOUND_POOL_FEE_WALLET,
  BOUND_POOL_VESTING_PERIOD,
  COMPUTE_UNIT_PRICE,
  DEFAULT_MAX_M_V2,
  FULL_MEME_AMOUNT_CONVERTED_V2,
  MAX_TICKET_TOKENS_V2,
  MEMECHAN_MEME_TOKEN_DECIMALS,
  SWAP_FEE_WALLET,
  TOKEN_INFOS,
} from "../config/config";
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
import { ensureAssociatedTokenAccountWithIdempotentIX } from "../util/ensureAssociatedTokenAccountWithIdempotentIX";
import { NoBoundPoolExist } from "./errors";
import { getTokenInfoByMint } from "../config/helpers";
import { addWrapSOLInstructionIfNativeMint } from "../util/addWrapSOLInstructionIfNativeMint";
import { addUnwrapSOLInstructionIfNativeMint } from "../util/addUnwrapSOLInstructionIfNativeMint";
import { TokenInfo } from "../config/types";
import { MemechanClientV2 } from "../MemechanClientV2";
import { MemeTicketClientV2 } from "../memeticket/MemeTicketClientV2";
import { parseTxV2 } from "../tx-parsing/v2/parsingV2";
import { findMetadataPDA, getCreateMetadataTransactionV2 } from "../token/createMetadataV2";
import { ASSOCIATED_PROGRAM_ID } from "@coral-xyz/anchor/dist/cjs/utils/token";
import { BoundPoolClient } from "./BoundPoolClient";
import { TargetConfigClientV2 } from "../targetconfig/TargetConfigClientV2";
import { ChanSwapClient } from "../chan-swap/ChanSwapClient";
import { StakingPoolClientV2 } from "../staking-pool/StakingPoolClientV2";
import { MemechanSol } from "../schema/v2/v2";
import { AuthorityType, createSetAuthorityInstruction } from "@solana/spl-token";
import { ensureAssociatedTokenAccountWithIX } from "../util/ensureAssociatedTokenAccountWithIX";

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
    const { TOKEN_PROGRAM_ID } = await import("@solana/spl-token");
    const boundClientInstance = new BoundPoolClientV2(
      poolAccountAddressId,
      client,
      poolObjectData.memeReserve.vault,
      poolObjectData.quoteReserve.vault,
      poolObjectData.memeReserve.mint,
      poolObjectData.quoteReserve.mint,
      new Token(TOKEN_PROGRAM_ID, new PublicKey(poolObjectData.memeReserve.mint), MEMECHAN_MEME_TOKEN_DECIMALS),
      poolObjectData,
    );

    return boundClientInstance;
  }

  public static fromAccountInfo({
    client,
    poolAccountAddressId,
    accountInfo,
  }: {
    client: MemechanClientV2;
    poolAccountAddressId: PublicKey;
    accountInfo: AccountInfo<Buffer>;
  }) {
    const poolObjectData = CodegenBoundPool.decode(accountInfo.data);
    const TOKEN_PROGRAM_ID = new PublicKey("TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA");
    const boundClientInstance = new BoundPoolClientV2(
      poolAccountAddressId,
      client,
      poolObjectData.memeReserve.vault,
      poolObjectData.quoteReserve.vault,
      poolObjectData.memeReserve.mint,
      poolObjectData.quoteReserve.mint,
      new Token(TOKEN_PROGRAM_ID, new PublicKey(poolObjectData.memeReserve.mint), MEMECHAN_MEME_TOKEN_DECIMALS),
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
    const { TOKEN_PROGRAM_ID } = await import("@solana/spl-token");
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
    isSimulated = false,
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
    const airdroppedTokens = new BN(0); // TODO: Add airdropped tokens

    const memeMintKeypair = args.memeMintKeypair ?? Keypair.generate();
    const memeMint = memeMintKeypair.publicKey;
    const id = this.findBoundPoolPda(memeMintKeypair.publicKey, quoteToken.mint, args.client.memechanProgram.programId);
    const poolSigner = BoundPoolClientV2.findSignerPda(id, args.client.memechanProgram.programId);

    const createMemeMintWithPriorityInstructions = (
      await getCreateMintWithPriorityTransaction(
        connection,
        payer,
        payer,
        null,
        MEMECHAN_MEME_TOKEN_DECIMALS,
        memeMintKeypair,
      )
    ).instructions;

    createPoolTransaction.add(...createMemeMintWithPriorityInstructions);

    // change authority of meme mint to poolSigner
    const changeAuthorityIX = createSetAuthorityInstruction(memeMint, payer, AuthorityType.MintTokens, poolSigner);
    createPoolTransaction.add(changeAuthorityIX);

    let feeQuoteVault: PublicKey | undefined = feeQuoteVaultPk;

    // If `feeQuoteVaultPk` is not passed in args, we need to find out, whether a quote account for an admin
    // already exists
    if (!feeQuoteVault) {
      feeQuoteVault = await ensureAssociatedTokenAccountWithIX({
        connection,
        payer,
        mint: quoteToken.mint,
        owner: new PublicKey(BOUND_POOL_FEE_WALLET),
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
    const { TOKEN_PROGRAM_ID } = await import("@solana/spl-token");
    const createPoolInstruction = await memechanProgram.methods
      .newPool(airdroppedTokens, BOUND_POOL_VESTING_PERIOD)
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
      await getCreateMetadataTransactionV2(
        client,
        {
          payer,
          mint: memeMint,
          poolSigner,
          poolId: id,
          metadata: tokenMetadata,
        },
        isSimulated,
      )
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
    const { TOKEN_PROGRAM_ID } = await import("@solana/spl-token");
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
      await this.getCreateNewBondingPoolAndBuyAndTokenWithBuyMemeTransaction(
        {
          ...args,
          payer: payer.publicKey,
        },
        true,
      );

    const signers = [payer, memeMintKeypair, client.simulationKeypair];
    const result = await client.connection.simulateTransaction(createPoolTransaction, signers, true);

    // If error happened (e.g. pool is locked)
    if (result.value.err) {
      console.log("[getOutputAmountForBuyMeme] error on simulation ", JSON.stringify(result.value));
      console.log("\n==================\n");
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

  public async all(program: Program<MemechanSol>): Promise<{ account: BoundPoolFields; publicKey: PublicKey }[]> {
    return BoundPoolClientV2.all(program);
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
    const { mintTo } = await import("@solana/spl-token");
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
    const { getOrCreateAssociatedTokenAccount } = await import("@solana/spl-token");
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
    const { TOKEN_PROGRAM_ID } = await import("@solana/spl-token");
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
      inputTokenAccount = await ensureAssociatedTokenAccountWithIdempotentIX({
        connection: connection,
        payer: user,
        mint: this.quoteTokenMint,
        owner: user,
        transaction,
      });
    }

    addWrapSOLInstructionIfNativeMint(this.quoteTokenMint, user, inputTokenAccount, inputAmountBN, transaction);
    const { TOKEN_PROGRAM_ID } = await import("@solana/spl-token");
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
      inputTokenAccount = await ensureAssociatedTokenAccountWithIdempotentIX({
        connection: client.connection,
        payer: user,
        mint: quoteMint,
        owner: user,
        transaction,
      });
    }
    addWrapSOLInstructionIfNativeMint(quoteMint, user, inputTokenAccount, inputAmountBN, transaction);
    const { TOKEN_PROGRAM_ID } = await import("@solana/spl-token");
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
      outputTokenAccount = await ensureAssociatedTokenAccountWithIdempotentIX({
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
    const { TOKEN_PROGRAM_ID } = await import("@solana/spl-token");
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

    for (const tx of optimizedTransactions) {
      addUnwrapSOLInstructionIfNativeMint(this.quoteTokenMint, user, tx);
    }

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
    const { TOKEN_PROGRAM_ID } = await import("@solana/spl-token");
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
    const stakingQuoteVault = await ensureAssociatedTokenAccountWithIdempotentIX({
      connection: this.client.connection,
      payer: payer.publicKey,
      mint: boundPoolInfo.quoteReserve.mint,
      owner: stakingSigner,
      transaction: tx,
    });

    const stakingMemeVault = await ensureAssociatedTokenAccountWithIdempotentIX({
      connection: this.client.connection,
      payer: payer.publicKey,
      mint: boundPoolInfo.memeReserve.mint,
      owner: stakingSigner,
      transaction: tx,
    });

    const stakingChanVault = await ensureAssociatedTokenAccountWithIdempotentIX({
      connection: this.client.connection,
      payer: payer.publicKey,
      mint: TOKEN_INFOS.CHAN.mint,
      owner: stakingSigner,
      transaction: tx,
    });
    const { TOKEN_PROGRAM_ID } = await import("@solana/spl-token");
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
      systemProgram: SystemProgram.programId,
      tokenProgram: TOKEN_PROGRAM_ID,
      rent: SYSVAR_RENT_PUBKEY,
      memeMint: boundPoolInfo.memeReserve.mint,
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

  public static async getInitQuoteAmmPoolTransaction(args: GetInitQuoteAmmPoolTransactionStaticArgs): Promise<{
    goLiveTransaction: VersionedTransaction;
    stakingId: PublicKey;
  }> {
    const { user, memeVault, quoteVault, transaction = new Transaction(), tokenInfoA, tokenInfoB, client } = args;

    const vaultModule = await import("@mercurial-finance/vault-sdk");
    const VaultImpl = vaultModule.default;
    const { getVaultPdas } = vaultModule;

    const { connection, memechanProgram } = client;
    const memechanProgramId = memechanProgram.programId;

    const stakingId = BoundPoolClientV2.findStakingPda(tokenInfoA.mint, memechanProgramId);
    const stakingSigner = StakingPoolClient.findSignerPda(stakingId, memechanProgramId);

    transaction.add(
      SystemProgram.transfer({
        fromPubkey: user.publicKey,
        toPubkey: stakingSigner,
        lamports: 40_000_000,
      }),
    );
    console.log("staking signer ", stakingSigner);

    const modifyComputeUnits = ComputeBudgetProgram.setComputeUnitLimit({
      units: 500000,
    });

    const utils = await import("@mercurial-finance/dynamic-amm-sdk/dist/cjs/src/amm/utils");

    transaction.add(modifyComputeUnits);

    const addPriorityFee = ComputeBudgetProgram.setComputeUnitPrice({
      microLamports: COMPUTE_UNIT_PRICE * 400,
    });

    transaction.add(addPriorityFee);

    const tradeFeeBps = new BN(100);

    const { vaultProgram, ammProgram } = utils.createProgram(connection);

    const tokenAMint = tokenInfoA.mint;
    const tokenBMint = tokenInfoB.mint;
    const [
      { vaultPda: aVault, tokenVaultPda: aTokenVault, lpMintPda: aLpMintPda },
      { vaultPda: bVault, tokenVaultPda: bTokenVault, lpMintPda: bLpMintPda },
    ] = [getVaultPdas(tokenAMint, vaultProgram.programId), getVaultPdas(tokenBMint, vaultProgram.programId)];
    const [aVaultAccount, bVaultAccount] = await Promise.all([
      vaultProgram.account.vault.fetchNullable(aVault),
      vaultProgram.account.vault.fetchNullable(bVault),
    ]);

    console.log("1");
    let aVaultLpMint = aLpMintPda;
    let bVaultLpMint = bLpMintPda;
    let preInstructions: Array<TransactionInstruction> = [];

    if (!aVaultAccount) {
      const createVaultAIx = await VaultImpl.createPermissionlessVaultInstruction(
        client.connection,
        user.publicKey,
        tokenInfoA.toSplTokenInfo(),
      );
      createVaultAIx && preInstructions.push(createVaultAIx);
    } else {
      aVaultLpMint = aVaultAccount.lpMint; // Old vault doesn't have lp mint pda
    }
    if (!bVaultAccount) {
      const createVaultBIx = await VaultImpl.createPermissionlessVaultInstruction(
        client.connection,
        user.publicKey,
        tokenInfoB.toSplTokenInfo(),
      );
      createVaultBIx && preInstructions.push(createVaultBIx);
    } else {
      bVaultLpMint = bVaultAccount.lpMint; // Old vault doesn't have lp mint pda
    }

    if (preInstructions.length > 0) {
      console.log("2", preInstructions[0].programId.toBase58());

      const txResult = await sendAndConfirmTransaction(
        client.connection,
        new Transaction().add(...preInstructions),
        [user],
        {
          commitment: "confirmed",
          skipPreflight: true,
          preflightCommitment: "confirmed",
        },
      );

      console.log("2 txResult", txResult);
    }
    const poolPubkey = utils.derivePoolAddress(
      connection,
      tokenInfoA.toSplTokenInfo(),
      tokenInfoB.toSplTokenInfo(),
      false,
      tradeFeeBps,
    );
    console.log("3");
    const [[aVaultLp], [bVaultLp]] = [
      PublicKey.findProgramAddressSync([aVault.toBuffer(), poolPubkey.toBuffer()], ammProgram.programId),
      PublicKey.findProgramAddressSync([bVault.toBuffer(), poolPubkey.toBuffer()], ammProgram.programId),
    ];
    const { FEE_OWNER, SEEDS } = await import("@mercurial-finance/dynamic-amm-sdk/dist/cjs/src/amm/constants");
    const [[adminTokenAFee], [adminTokenBFee]] = [
      PublicKey.findProgramAddressSync(
        [Buffer.from(SEEDS.FEE), tokenAMint.toBuffer(), poolPubkey.toBuffer()],
        ammProgram.programId,
      ),
      PublicKey.findProgramAddressSync(
        [Buffer.from(SEEDS.FEE), tokenBMint.toBuffer(), poolPubkey.toBuffer()],
        ammProgram.programId,
      ),
    ];

    console.log("4");
    const [lpMint] = PublicKey.findProgramAddressSync(
      [Buffer.from(SEEDS.LP_MINT), poolPubkey.toBuffer()],
      ammProgram.programId,
    );

    const [mintMetadata] = utils.deriveMintMetadata(lpMint);

    const [lockEscrowPK] = utils.deriveLockEscrowPda(poolPubkey, stakingSigner, ammProgram.programId);

    console.log("5");
    preInstructions = [];

    const payerPoolLp = await utils.getAssociatedTokenAccount(lpMint, stakingSigner);

    const escrowAta = await utils.getAssociatedTokenAccount(lpMint, lockEscrowPK);
    console.log(escrowAta);
    const { TOKEN_PROGRAM_ID } = await import("@solana/spl-token");
    console.log("7");
    const goLiveInstruction = await client.memechanProgram.methods
      .initMemeAmmPool()
      .accounts({
        adminTokenAFee,
        adminTokenBFee,
        ammPool: poolPubkey,
        aTokenVault,
        aVault,
        aVaultLp,
        aVaultLpMint,
        bTokenVault,
        bVault,
        bVaultLp,
        bVaultLpMint,
        lpMint,
        mintMetadata,
        escrowVault: escrowAta,
        feeOwner: FEE_OWNER,
        lockEscrow: lockEscrowPK,
        payerPoolLp: payerPoolLp,
        quoteMint: tokenBMint,
        memeMint: tokenInfoA.mint,

        staking: stakingId,
        stakingMemeVault: memeVault,
        stakingPoolSignerPda: stakingSigner,
        stakingQuoteVault: quoteVault,
        signer: user.publicKey,

        rent: SYSVAR_RENT_PUBKEY,
        ataProgram: ATA_PROGRAM_ID,
        tokenProgram: TOKEN_PROGRAM_ID,
        systemProgram: SystemProgram.programId,
        metadataProgram: METADATA_PROGRAM_ID,
        ammProgram: ammProgram.programId,
        vaultProgram: vaultProgram.programId,
      })
      .instruction();

    transaction.add(goLiveInstruction);

    // seems like we could fit in here
    const transferCreatorFundTx = await this.getTransferCreatorBonusChanFundsTx({
      ...args.transferCreatorBonusArgs,
      transaction: transaction,
    });
    console.log("transferCreatorFundSignature", transferCreatorFundTx);

    const admin = user.publicKey;
    let slot = await connection.getSlot("confirmed");
    const [createLUTix, LUTaddr] = AddressLookupTableProgram.createLookupTable({
      authority: admin,
      payer: admin,
      recentSlot: slot,
    });
    const extendIxs = AddressLookupTableProgram.extendLookupTable({
      payer: admin,
      lookupTable: LUTaddr,
      authority: admin,
      addresses: [
        admin,
        SystemProgram.programId,
        TOKEN_PROGRAM_ID,
        ASSOCIATED_PROGRAM_ID,
        client.memechanProgram.programId,
        TargetConfigClientV2.findTargetConfigPda(TOKEN_INFOS.WSOL.mint, client.memechanProgram.programId),
        poolPubkey,
        user.publicKey,
        FEE_OWNER,
        SYSVAR_RENT_PUBKEY,
        TOKEN_INFOS.WSOL.mint,
      ],
    });

    const tx = new Transaction().add(addPriorityFee, createLUTix, extendIxs);
    const initMemeAmmPoolTxResult = await sendAndConfirmTransaction(connection, tx, [user], {
      commitment: "confirmed",
      preflightCommitment: "confirmed",
      skipPreflight: true,
    });

    console.log("initMemeAmmPoolTxResult", initMemeAmmPoolTxResult);

    slot = await connection.getSlot("confirmed");
    // const lutAddr = getLUTPDA({
    //   authority: admin,
    //   recentSlot: slot,
    // });

    // console.log(lutAddr);

    console.log("trying LUT");
    const lookupTableAccount = await BoundPoolClientV2.waitForLookupTableAccount(connection, LUTaddr);
    // const lookupTableAccount = (await connection.getAddressLookupTable(lutAddr)).value;

    console.log("lookupTableAccount", lookupTableAccount);

    const blockhash = await connection.getLatestBlockhash();

    const txMessage = new TransactionMessage({
      instructions: transaction.instructions,
      payerKey: user.publicKey,
      recentBlockhash: blockhash.blockhash,
    }).compileToV0Message([lookupTableAccount!]);

    const transactionV0 = new VersionedTransaction(txMessage);

    console.log("44");
    transactionV0.sign([user]);

    return {
      goLiveTransaction: transactionV0,
      stakingId,
    };
  }

  private static async waitForLookupTableAccount(
    connection: Connection,
    lutAddr: PublicKey,
    interval: number = 2000,
  ): Promise<AddressLookupTableAccount> {
    let retries = 0;
    const maxRetries = 10;
    while (retries < maxRetries) {
      const lookupTableAccount = (await connection.getAddressLookupTable(lutAddr)).value;
      if (lookupTableAccount) {
        return lookupTableAccount;
      }
      await sleep(interval);
      retries++;
    }
    throw new Error(`Lookup table account not found after ${maxRetries} retries`);
  }

  public static async getInitChanAmmPoolTransaction(args: GetInitChanAmmPoolTransactionStaticArgs): Promise<{
    goLiveTransaction: VersionedTransaction;
    stakingId: PublicKey;
  }> {
    const { user, memeVault, transaction = new Transaction(), tokenInfoA, tokenInfoB, chanSwap, client } = args;
    const stakingId = BoundPoolClient.findStakingPda(tokenInfoA.mint, client.memechanProgram.programId);
    const stakingSigner = StakingPoolClient.findSignerPda(stakingId, client.memechanProgram.programId);

    transaction.add(
      SystemProgram.transfer({
        fromPubkey: user.publicKey,
        toPubkey: stakingSigner,
        lamports: 40_000_000,
      }),
    );

    const modifyComputeUnits = ComputeBudgetProgram.setComputeUnitLimit({
      units: 600000,
    });

    transaction.add(modifyComputeUnits);

    const addPriorityFee = ComputeBudgetProgram.setComputeUnitPrice({
      microLamports: COMPUTE_UNIT_PRICE * 200,
    });

    transaction.add(addPriorityFee);

    const tradeFeeBps = new BN(100);
    const { connection } = client;

    const utils = await import("@mercurial-finance/dynamic-amm-sdk/dist/cjs/src/amm/utils");

    const { vaultProgram, ammProgram } = utils.createProgram(connection);

    const tokenAMint = new PublicKey(tokenInfoA.mint);
    const tokenBMint = new PublicKey(tokenInfoB.mint);
    const vaultModule = await import("@mercurial-finance/vault-sdk");
    const VaultImpl = vaultModule.default;
    const { getVaultPdas } = vaultModule;
    const [
      { vaultPda: aVault, tokenVaultPda: aTokenVault, lpMintPda: aLpMintPda },
      { vaultPda: bVault, tokenVaultPda: bTokenVault, lpMintPda: bLpMintPda },
    ] = [getVaultPdas(tokenAMint, vaultProgram.programId), getVaultPdas(tokenBMint, vaultProgram.programId)];
    const [aVaultAccount, bVaultAccount] = await Promise.all([
      vaultProgram.account.vault.fetchNullable(aVault),
      vaultProgram.account.vault.fetchNullable(bVault),
    ]);

    console.log("1");
    let aVaultLpMint = aLpMintPda;
    let bVaultLpMint = bLpMintPda;
    let preInstructions: Array<TransactionInstruction> = [];

    if (!aVaultAccount) {
      const createVaultAIx = await VaultImpl.createPermissionlessVaultInstruction(
        connection,
        user.publicKey,
        tokenInfoA.toSplTokenInfo(),
      );
      createVaultAIx && preInstructions.push(createVaultAIx);
    } else {
      aVaultLpMint = aVaultAccount.lpMint; // Old vault doesn't have lp mint pda
    }
    if (!bVaultAccount) {
      const createVaultBIx = await VaultImpl.createPermissionlessVaultInstruction(
        connection,
        user.publicKey,
        tokenInfoB.toSplTokenInfo(),
      );
      createVaultBIx && preInstructions.push(createVaultBIx);
    } else {
      bVaultLpMint = bVaultAccount.lpMint; // Old vault doesn't have lp mint pda
    }

    if (preInstructions.length > 0) {
      console.log("2", preInstructions[0].programId.toBase58());

      const txResult = await sendAndConfirmTransaction(
        client.connection,
        new Transaction().add(...preInstructions),
        [user],
        {
          commitment: "confirmed",
          skipPreflight: true,
          preflightCommitment: "confirmed",
        },
      );

      console.log("2 txResult", txResult);
    }

    const poolPubkey = utils.derivePoolAddress(
      connection,
      tokenInfoA.toSplTokenInfo(),
      tokenInfoB.toSplTokenInfo(),
      false,
      tradeFeeBps,
    );
    console.log("3");
    const [[aVaultLp], [bVaultLp]] = [
      PublicKey.findProgramAddressSync([aVault.toBuffer(), poolPubkey.toBuffer()], ammProgram.programId),
      PublicKey.findProgramAddressSync([bVault.toBuffer(), poolPubkey.toBuffer()], ammProgram.programId),
    ];
    const { FEE_OWNER, SEEDS } = await import("@mercurial-finance/dynamic-amm-sdk/dist/cjs/src/amm/constants");
    const [[adminTokenAFee], [adminTokenBFee]] = [
      PublicKey.findProgramAddressSync(
        [Buffer.from(SEEDS.FEE), tokenAMint.toBuffer(), poolPubkey.toBuffer()],
        ammProgram.programId,
      ),
      PublicKey.findProgramAddressSync(
        [Buffer.from(SEEDS.FEE), tokenBMint.toBuffer(), poolPubkey.toBuffer()],
        ammProgram.programId,
      ),
    ];

    console.log("4");
    const [lpMint] = PublicKey.findProgramAddressSync(
      [Buffer.from(SEEDS.LP_MINT), poolPubkey.toBuffer()],
      ammProgram.programId,
    );

    const [mintMetadata] = utils.deriveMintMetadata(lpMint);

    const [lockEscrowPK] = utils.deriveLockEscrowPda(poolPubkey, stakingSigner, ammProgram.programId);

    console.log("5");
    preInstructions = [];

    const payerPoolLp = await utils.getAssociatedTokenAccount(lpMint, stakingSigner);

    const escrowAta = await utils.getAssociatedTokenAccount(lpMint, lockEscrowPK);
    console.log(escrowAta);

    const fetchedChanSwap = await client.memechanProgram.account.chanSwap.fetch(chanSwap);

    const staking = await client.memechanProgram.account.stakingPool.fetch(stakingId);

    const swapFeeTokenAccountTx = new Transaction();
    const feeQuoteVault = await ensureAssociatedTokenAccountWithIdempotentIX({
      connection: connection,
      payer: user.publicKey,
      mint: TOKEN_INFOS.WSOL.mint,
      owner: new PublicKey(SWAP_FEE_WALLET),
      transaction: swapFeeTokenAccountTx,
    });

    if (swapFeeTokenAccountTx.instructions.length > 0) {
      swapFeeTokenAccountTx.add(addPriorityFee);
      console.log("6 - creating token account for SWAP_FEE_WALLET");
      const txResult = await sendAndConfirmTransaction(connection, swapFeeTokenAccountTx, [user], {
        commitment: "confirmed",
        skipPreflight: true,
        preflightCommitment: "confirmed",
      });
      console.log("6 txResult", txResult);
    }

    const { TOKEN_PROGRAM_ID } = await import("@solana/spl-token");

    console.log("7");
    const goLiveInstruction = await client.memechanProgram.methods
      .initChanAmmPool()
      .accounts({
        adminTokenAFee,
        adminTokenBFee,
        ammPool: poolPubkey,
        aTokenVault,
        aVault,
        aVaultLp,
        aVaultLpMint,
        bTokenVault,
        bVault,
        bVaultLp,
        bVaultLpMint,
        lpMint,
        mintMetadata,
        escrowVault: escrowAta,
        feeOwner: FEE_OWNER,
        lockEscrow: lockEscrowPK,
        payerPoolLp: payerPoolLp,
        chanMint: tokenBMint,
        memeMint: tokenInfoA.mint,

        staking: stakingId,
        stakingMemeVault: memeVault,
        stakingPoolSignerPda: stakingSigner,
        stakingChanVault: staking.chanVault,
        stakingQuoteVault: staking.quoteVault,

        feeQuoteVault: feeQuoteVault,
        chanSwap,
        chanSwapSignerPda: ChanSwapClient.chanSwapSigner(),
        chanSwapVault: fetchedChanSwap.chanVault,

        signer: user.publicKey,

        rent: SYSVAR_RENT_PUBKEY,
        ataProgram: ATA_PROGRAM_ID,
        tokenProgram: TOKEN_PROGRAM_ID,
        systemProgram: SystemProgram.programId,
        metadataProgram: METADATA_PROGRAM_ID,
        ammProgram: ammProgram.programId,
        vaultProgram: vaultProgram.programId,
      })
      .instruction();

    transaction.add(goLiveInstruction);

    const admin = user.publicKey;
    const slot = await connection.getSlot("confirmed");
    const [createLUTix, LUTaddr] = AddressLookupTableProgram.createLookupTable({
      authority: admin,
      payer: admin,
      recentSlot: slot,
    });

    const extendIxs = AddressLookupTableProgram.extendLookupTable({
      payer: admin,
      lookupTable: LUTaddr,
      authority: admin,
      addresses: [
        admin,
        SystemProgram.programId,
        TOKEN_PROGRAM_ID,
        ASSOCIATED_PROGRAM_ID,
        client.memechanProgram.programId,
        TargetConfigClientV2.findTargetConfigPda(TOKEN_INFOS.WSOL.mint, client.memechanProgram.programId),
        poolPubkey,
        user.publicKey,
        FEE_OWNER,
        SYSVAR_RENT_PUBKEY,
        TOKEN_INFOS.WSOL.mint,
        TOKEN_INFOS.CHAN.mint,
        ChanSwapClient.chanSwapId(),
        ChanSwapClient.chanSwapSigner(),
      ],
    });

    const tx = new Transaction().add(addPriorityFee, createLUTix, extendIxs);
    const initChanAmmPoolTxResult = await sendAndConfirmTransaction(connection, tx, [user], {
      commitment: "confirmed",
      preflightCommitment: "confirmed",
      skipPreflight: true,
    });

    console.log("initChanAmmPoolTxResult", initChanAmmPoolTxResult);

    console.log("trying LUT");
    const lookupTableAccount = await BoundPoolClientV2.waitForLookupTableAccount(connection, LUTaddr);
    // const lookupTableAccount = (await connection.getAddressLookupTable(lutAddr)).value;

    console.log("lookupTableAccount", lookupTableAccount);

    const blockhash = await connection.getLatestBlockhash();

    const txMessage = new TransactionMessage({
      instructions: transaction.instructions,
      payerKey: user.publicKey,
      recentBlockhash: blockhash.blockhash,
    }).compileToV0Message([lookupTableAccount!]);

    const transactionV0 = new VersionedTransaction(txMessage);

    console.log("44");
    transactionV0.sign([user]);

    return {
      goLiveTransaction: transactionV0,
      stakingId,
    };
  }

  public static async initQuoteAmmPool(args: GetInitQuoteAmmPoolTransactionStaticArgs): Promise<StakingPoolClientV2> {
    console.log("initQuoteAmmPool static Begin");
    const { client } = args;
    // Get needed transactions
    const { goLiveTransaction, stakingId } = await BoundPoolClientV2.getInitQuoteAmmPoolTransaction(args);

    const serializedTransaction = goLiveTransaction.serialize();
    // Calculate the transaction size in bytes
    const transactionSize = serializedTransaction.length;
    console.log(`Transaction size: ${transactionSize} bytes`);

    console.log("goLive2 1");
    // Send transaction to go live
    const goLiveSignature = await client.connection.sendTransaction(goLiveTransaction, { skipPreflight: true });

    console.log("go live signature:", goLiveSignature);

    // Check go live succeeded
    const { blockhash: blockhash1, lastValidBlockHeight: lastValidBlockHeight1 } =
      await client.connection.getLatestBlockhash("confirmed");
    const goLiveTxResult = await client.connection.confirmTransaction(
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

    const stakingPoolInstance = await StakingPoolClientV2.fromStakingPoolId({
      client: client,
      poolAccountAddressId: stakingId,
    });

    return stakingPoolInstance;
  }

  public async initQuoteAmmPool(args: GetInitQuoteAmmPoolTransactionArgs): Promise<StakingPoolClientV2> {
    console.log("initQuoteAmmPool Begin");
    // Get needed transactions
    const { goLiveTransaction, stakingId } = await BoundPoolClientV2.getInitQuoteAmmPoolTransaction({
      ...args,
      client: this.client,
    });

    const serializedTransaction = goLiveTransaction.serialize();
    // Calculate the transaction size in bytes
    const transactionSize = serializedTransaction.length;
    console.log(`Transaction size: ${transactionSize} bytes`);

    console.log("goLive2 1");
    // Send transaction to go live
    const goLiveSignature = await this.client.connection.sendTransaction(goLiveTransaction, { skipPreflight: true });

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

    const stakingPoolInstance = await StakingPoolClientV2.fromStakingPoolId({
      client: this.client,
      poolAccountAddressId: stakingId,
    });

    return stakingPoolInstance;
  }

  public static async initChanAmmPool(args: GetInitChanAmmPoolTransactionStaticArgs) {
    console.log("initChanAmmPool Begin");
    const { client } = args;
    // Get needed transactions
    const { goLiveTransaction, stakingId } = await BoundPoolClientV2.getInitChanAmmPoolTransaction(args);

    const serializedTransaction = goLiveTransaction.serialize();
    // Calculate the transaction size in bytes
    const transactionSize = serializedTransaction.length;
    console.log(`Transaction size: ${transactionSize} bytes`);

    console.log("goLive2 1");
    // Send transaction to go live
    const goLiveSignature = await client.connection.sendTransaction(goLiveTransaction, { skipPreflight: true });

    console.log("go live signature:", goLiveSignature);

    // Check go live succeeded
    const { blockhash: blockhash1, lastValidBlockHeight: lastValidBlockHeight1 } =
      await client.connection.getLatestBlockhash("confirmed");
    const goLiveTxResult = await client.connection.confirmTransaction(
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

    const stakingPoolInstance = await StakingPoolClientV2.fromStakingPoolId({
      client: client,
      poolAccountAddressId: stakingId,
    });

    return stakingPoolInstance;
  }

  public async initChanAmmPool(args: GetInitChanPoolTransactionArgs) {
    console.log("initChanAmmPool Begin");
    // Get needed transactions

    const { goLiveTransaction, stakingId } = await BoundPoolClientV2.getInitChanAmmPoolTransaction(args);

    console.log("goLive2 1");
    // Send transaction to go live
    const goLiveSignature = await this.client.connection.sendTransaction(goLiveTransaction, { skipPreflight: true });

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

    const stakingPoolInstance = await StakingPoolClientV2.fromStakingPoolId({
      client: this.client,
      poolAccountAddressId: stakingId,
    });

    return stakingPoolInstance;
  }

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

  public getMaxTicketTokens() {
    return MAX_TICKET_TOKENS_V2;
  }

  public getMetadataAddress() {
    return BoundPoolClientV2.getMetadataAddress(this.memeTokenMint);
  }

  public static getMetadataAddress(mint: PublicKey) {
    return findMetadataPDA(mint);
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
      if (!uniqueHolders.has(BOUND_POOL_FEE_WALLET)) {
        const adminTicket = {
          amount: pool.adminFeesMeme,
          owner: new PublicKey(BOUND_POOL_FEE_WALLET),
          pool: poolId,
        } as MemeTicketFields;
        uniqueHolders.set(BOUND_POOL_FEE_WALLET, [adminTicket]);
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
    client,
  }: {
    boundPoolInfo: BoundPool;
    quotePriceInUsd: number;
    client: MemechanClientV2;
  }): Promise<{ priceInQuote: string; priceInUsd: string }> {
    const memeBalance = new BigNumber(boundPoolInfo.memeReserve.tokens.toString());
    const quoteBalance = new BigNumber(boundPoolInfo.quoteReserve.tokens.toString());

    const quoteInfo = getTokenInfoByMint(boundPoolInfo.quoteReserve.mint);
    const quoteBalanceConverted = quoteBalance.div(10 ** quoteInfo.decimals);
    const soldMemeConverted = new BigNumber(DEFAULT_MAX_M_V2)
      .minus(memeBalance)
      .div(10 ** MEMECHAN_MEME_TOKEN_DECIMALS);

    // In case no meme coins were sold from the pool, fetch the initial meme price
    if (soldMemeConverted.eq(0)) {
      console.log("Fetching initial meme price");
      const initialMemePrice = await this.getInitialMemePrice({ boundPoolInfo, quotePriceInUsd, client });
      return initialMemePrice;
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
    boundPoolInfo,
    quotePriceInUsd,
    client,
  }: {
    boundPoolInfo: BoundPool;
    quotePriceInUsd: number;
    client: MemechanClientV2;
  }): Promise<{ priceInQuote: string; priceInUsd: string }> {
    const DUMMY_TOKEN_METADATA = {
      name: "Best Token Ever",
      symbol: "BTE",
      image: "https://cf-ipfs.com/ipfs/QmVevMfxFpfgBu5kHuYUPmDMaV6pWkAn3zw5XaCXxKdaBh",
      description: "This is the best token ever",
      twitter: "https://twitter.com/BestTokenEver",
      telegram: "https://t.me/BestTokenEver",
      website: "https://besttokenever.com",
      discord: "",
    };

    const quoteInfo = getTokenInfoByMint(boundPoolInfo.quoteReserve.mint);
    const quoteBalanceString = "0.000001";
    const quoteBalance = new BigNumber(quoteBalanceString);
    const quoteBalanceConverted = quoteBalance.div(10 ** quoteInfo.decimals);

    console.log("quoteBalanceConverted.toFixed(): " + quoteBalanceConverted.toFixed());

    const soldMemeSimulated = await BoundPoolClientV2.getOutputAmountForNewPoolWithBuyMemeTx({
      admin: ADMIN_PUB_KEY,
      client,
      payer: client.simulationKeypair,
      quoteToken: TOKEN_INFOS.WSOL,
      tokenMetadata: DUMMY_TOKEN_METADATA,
      targetConfig: TOKEN_INFOS.WSOL.targetConfigV2,
      buyMemeTransactionArgs: {
        inputAmount: quoteBalanceString,
        minOutputAmount: "1",
        slippagePercentage: 0,
        user: client.simulationKeypair.publicKey,
        memeTicketNumber: MemeTicketClientV2.TICKET_NUMBER_START,
      },
    });

    console.log("soldMemeSimulated: " + soldMemeSimulated);

    const soldMemeConverted = new BigNumber(soldMemeSimulated);

    const memePriceInQuote = quoteBalance.div(soldMemeConverted).multipliedBy(new BigNumber(0.99)); // 1% correction
    const memePriceInUsd = memePriceInQuote.multipliedBy(quotePriceInUsd).toString();

    return { priceInQuote: memePriceInQuote.toString(), priceInUsd: memePriceInUsd };
  }

  public static getMemeMarketCap({ memePriceInUsd }: { memePriceInUsd: string }): string {
    const marketCap = new BigNumber(FULL_MEME_AMOUNT_CONVERTED_V2).multipliedBy(memePriceInUsd).toString();

    return marketCap;
  }

  public static async getTransferCreatorBonusChanFundsTx(
    args: TransferCreatorBonusChanFundsArgs,
  ): Promise<Transaction> {
    const { creator, payer, connection, amount, transaction = new Transaction() } = args;

    const { TOKEN_PROGRAM_ID, getAssociatedTokenAddressSync, ASSOCIATED_TOKEN_PROGRAM_ID } = await import(
      "@solana/spl-token"
    );

    // this should already exist, no need to create
    const fromTokenAccount = getAssociatedTokenAddressSync(
      TOKEN_INFOS.CHAN.mint,
      payer.publicKey,
      true,
      TOKEN_PROGRAM_ID,
      ASSOCIATED_TOKEN_PROGRAM_ID,
    );

    const toTokenAccountTx = new Transaction();
    const toTokenAccount = await ensureAssociatedTokenAccountWithIdempotentIX({
      connection: connection,
      payer: payer.publicKey,
      mint: TOKEN_INFOS.CHAN.mint,
      owner: creator,
      transaction: toTokenAccountTx,
    });

    const addPriorityFee = ComputeBudgetProgram.setComputeUnitPrice({
      microLamports: COMPUTE_UNIT_PRICE,
    });

    // we create it instantly, to not overload the main Tx
    if (toTokenAccountTx.instructions.length > 0) {
      toTokenAccountTx.add(addPriorityFee);
      console.log("6 - creating token account for creator");
      const txResult = await sendAndConfirmTransaction(connection, toTokenAccountTx, [payer], {
        commitment: "confirmed",
        skipPreflight: true,
        preflightCommitment: "confirmed",
      });
      console.log("6 txResult", txResult);
    }

    const { createTransferInstruction } = await import("@solana/spl-token");
    transaction.add(createTransferInstruction(fromTokenAccount, toTokenAccount, payer.publicKey, amount));

    // transaction.add(addPriorityFee);
    return transaction;
  }

  public static async transferCreatorBonusChanFunds(args: TransferCreatorBonusChanFundsArgs): Promise<string> {
    const { payer, connection } = args;
    const transaction = await BoundPoolClientV2.getTransferCreatorBonusChanFundsTx(args);

    const signature = await sendAndConfirmTransaction(connection, transaction, [payer], {
      commitment: "confirmed",
      skipPreflight: true,
      preflightCommitment: "confirmed",
    });

    return signature;
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
