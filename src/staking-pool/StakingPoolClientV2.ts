import {
  AccountMeta,
  Connection,
  PublicKey,
  SystemProgram,
  Transaction,
  TransactionInstruction,
  sendAndConfirmTransaction,
  Keypair,
  ComputeBudgetProgram,
  AccountInfo,
} from "@solana/web3.js";
import BigNumber from "bignumber.js";
import BN from "bn.js";
import { MemechanClientV2 } from "../MemechanClientV2";
import { BoundPoolClientV2 } from "../bound-pool/BoundPoolClientV2";
import {
  COMPUTE_UNIT_PRICE,
  LP_FEE_WALLET,
  MAX_MEME_TOKENS,
  MEMECHAN_PROGRAM_ID_V2,
  MEME_TOKEN_DECIMALS,
  TH_FEE_WALLET,
  TOKEN_INFOS,
} from "../config/config";
import { MemeTicketClientV2 } from "../memeticket/MemeTicketClientV2";
import { MemeTicketFields, StakingPool, StakingPoolFields } from "../schema/v2/codegen/accounts";
import { ensureAssociatedTokenAccountWithIdempotentIX } from "../util/ensureAssociatedTokenAccountWithIdempotentIX";
import { getSendAndConfirmTransactionMethod } from "../util/getSendAndConfirmTransactionMethod";
import { retry } from "../util/retry";
import {
  AddFeesArgs,
  GetAddFeesTransactionArgs,
  GetAvailableUnstakeAmountArgs,
  GetPreparedUnstakeTransactionsArgs,
  GetPreparedWithdrawFeesTransactionsArgs,
  GetUnstakeTransactionArgsV2,
  GetWithdrawFeesTransactionArgsV2,
  PrepareTransactionWithStakingTicketsMergeArgs,
  UnstakeArgsV2,
  WithdrawFeesArgsV2,
  getAvailableWithdrawFeesAmountArgsV2,
} from "./types";
import { addUnwrapSOLInstructionIfNativeMint } from "../util/addUnwrapSOLInstructionIfNativeMint";
import { getTokenInfoByMint } from "../config/helpers";
import { TokenInfo } from "../config/types";
import { AmmPool } from "../meteora/AmmPool";
import { MEMO_PROGRAM_ID } from "@raydium-io/raydium-sdk";
import { LivePoolClientV2 } from "../live-pool/LivePoolClientV2";

export class StakingPoolClientV2 {
  constructor(
    public id: PublicKey,
    private client: MemechanClientV2,
    public pool: PublicKey,
    public memeVault: PublicKey,
    public memeMint: PublicKey,
    public quoteVault: PublicKey,
    public poolObjectData: StakingPool,
  ) {}

  public static async fromStakingPoolId({
    client,
    poolAccountAddressId,
  }: {
    client: MemechanClientV2;
    poolAccountAddressId: PublicKey;
  }) {
    const stakingPoolObjectData = await StakingPool.fetch(client.connection, poolAccountAddressId);

    if (!stakingPoolObjectData) {
      throw new Error(`[fromStakingPoolId] Staking pool data is not found for ${poolAccountAddressId.toString()}.`);
    }

    const boundClientInstance = new StakingPoolClientV2(
      poolAccountAddressId,
      client,
      stakingPoolObjectData.pool,
      stakingPoolObjectData.memeVault,
      stakingPoolObjectData.memeMint,
      stakingPoolObjectData.quoteVault,
      stakingPoolObjectData,
    );

    return boundClientInstance;
  }

  public static fromAccountInfo({
    client,
    accountInfo,
    poolAccountAddressId,
  }: {
    client: MemechanClientV2;
    poolAccountAddressId: PublicKey;
    accountInfo: AccountInfo<Buffer>;
  }) {
    const stakingPoolObjectData = StakingPool.decode(accountInfo.data);

    if (!stakingPoolObjectData) {
      throw new Error(`[fromStakingPoolId] Staking pool could not be decoded for ${poolAccountAddressId.toString()}.`);
    }

    const boundClientInstance = new StakingPoolClientV2(
      poolAccountAddressId,
      client,
      stakingPoolObjectData.pool,
      stakingPoolObjectData.memeVault,
      stakingPoolObjectData.memeMint,
      stakingPoolObjectData.quoteVault,
      stakingPoolObjectData,
    );

    return boundClientInstance;
  }

  public async fromStakingPoolId() {
    if (!this.poolObjectData) {
      throw new Error(`[fromStakingPoolId] Staking pool data is not found for ${this.pool.toString()}.`);
    }

    const boundClientInstance = new StakingPoolClientV2(
      this.pool,
      this.client,
      this.poolObjectData.pool,
      this.poolObjectData.memeVault,
      this.poolObjectData.memeMint,
      this.poolObjectData.quoteVault,
      this.poolObjectData,
    );

    return boundClientInstance;
  }

  public static findSignerPda(publicKey: PublicKey, memechanProgramId: PublicKey): PublicKey {
    return PublicKey.findProgramAddressSync([Buffer.from("staking"), publicKey.toBytes()], memechanProgramId)[0];
  }

  public async getAddFeesTransaction(args: GetAddFeesTransactionArgs): Promise<Transaction> {
    const tx = args.transaction ?? new Transaction();
    const payer = args.payer;

    const { createProgram, deriveLockEscrowPda, derivePoolAddress, getAssociatedTokenAccount } = await import(
      "@mercurial-finance/dynamic-amm-sdk/dist/cjs/src/amm/utils"
    );
    const { default: VaultImpl, getVaultPdas } = await import("@mercurial-finance/vault-sdk");
    const tradeFeeBps = new BN(100);
    const connection = this.client.connection;
    const { vaultProgram, ammProgram } = createProgram(connection);

    const livePool = await LivePoolClientV2.fromAmmId(args.ammPoolId, this.client);

    const tokenAMint = new PublicKey(livePool.ammPool.ammImpl.tokenA.address);
    const tokenBMint = new PublicKey(livePool.ammPool.ammImpl.tokenB.address);

    const tokenInfoA = getTokenInfoByMint(tokenAMint);
    const tokenInfoB = getTokenInfoByMint(tokenBMint);

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
        payer,
        tokenInfoA.toSplTokenInfo(),
      );
      createVaultAIx && preInstructions.push(createVaultAIx);
    } else {
      aVaultLpMint = aVaultAccount.lpMint; // Old vault doesn't have lp mint pda
    }
    if (!bVaultAccount) {
      const createVaultBIx = await VaultImpl.createPermissionlessVaultInstruction(
        connection,
        payer,
        tokenInfoB.toSplTokenInfo(),
      );
      createVaultBIx && preInstructions.push(createVaultBIx);
    } else {
      bVaultLpMint = bVaultAccount.lpMint; // Old vault doesn't have lp mint pda
    }

    console.log("2");

    const poolPubkey = derivePoolAddress(
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

    // const [[adminTokenAFee], [adminTokenBFee]] = [
    //   PublicKey.findProgramAddressSync(
    //     [Buffer.from(SEEDS.FEE), tokenAMint.toBuffer(), poolPubkey.toBuffer()],
    //     ammProgram.programId,
    //   ),
    //   PublicKey.findProgramAddressSync(
    //     [Buffer.from(SEEDS.FEE), tokenBMint.toBuffer(), poolPubkey.toBuffer()],
    //     ammProgram.programId,
    //   ),
    // ];

    console.log("4");
    const { SEEDS } = await import("@mercurial-finance/dynamic-amm-sdk/dist/cjs/src/amm/constants");
    const [lpMint] = PublicKey.findProgramAddressSync(
      [Buffer.from(SEEDS.LP_MINT), poolPubkey.toBuffer()],
      ammProgram.programId,
    );

    // const [mintMetadata, _mintMetadataBump] = deriveMintMetadata(lpMint);

    const stakingSigner = this.findSignerPda();

    const [lockEscrowPK] = deriveLockEscrowPda(poolPubkey, stakingSigner, ammProgram.programId);

    console.log("5");
    preInstructions = [];

    const payerPoolLp = await getAssociatedTokenAccount(lpMint, stakingSigner);

    const escrowAta = await getAssociatedTokenAccount(lpMint, lockEscrowPK);
    console.log(escrowAta);
    const { TOKEN_PROGRAM_ID } = await import("@solana/spl-token");

    const memeFeeVault = await ensureAssociatedTokenAccountWithIdempotentIX({
      connection: this.client.connection,
      payer: payer,
      mint: this.memeMint,
      owner: new PublicKey(LP_FEE_WALLET),
      transaction: tx,
    });

    const quoteFeeVault = await ensureAssociatedTokenAccountWithIdempotentIX({
      connection: this.client.connection,
      payer: payer,
      mint: tokenBMint,
      owner: new PublicKey(LP_FEE_WALLET),
      transaction: tx,
    });

    const memeThFeeVault = await ensureAssociatedTokenAccountWithIdempotentIX({
      connection: this.client.connection,
      payer: payer,
      mint: this.memeMint,
      owner: new PublicKey(TH_FEE_WALLET),
      transaction: tx,
    });

    const quoteThFeeVault = await ensureAssociatedTokenAccountWithIdempotentIX({
      connection: this.client.connection,
      payer: payer,
      mint: tokenBMint,
      owner: new PublicKey(TH_FEE_WALLET),
      transaction: tx,
    });

    const quoteVault =
      tokenInfoB.mint === TOKEN_INFOS.CHAN.mint ? this.poolObjectData.chanVault : this.poolObjectData.quoteVault;

    console.log("7");

    const addFeesIx = await this.client.memechanProgram.methods
      .addFees()
      .accounts({
        memeFeeVault,
        quoteFeeVault,
        memeThFeeVault,
        quoteThFeeVault,
        ammPool: args.ammPoolId,
        aTokenVault,
        aVault,
        aVaultLp,
        aVaultLpMint,
        bTokenVault,
        bVault,
        bVaultLp,
        bVaultLpMint,
        escrowVault: escrowAta,
        lockEscrow: lockEscrowPK,
        lpMint,
        memeMint: this.memeMint,
        memeVault: this.memeVault,
        quoteMint: tokenBMint,
        quoteVault,
        signer: payer,
        sourceTokens: payerPoolLp,
        staking: this.id,
        stakingSignerPda: stakingSigner,
        ammProgram: ammProgram.programId,
        vaultProgram: vaultProgram.programId,
        tokenProgram: TOKEN_PROGRAM_ID,
        memoProgram: MEMO_PROGRAM_ID,
      })
      .instruction();

    const modifyComputeUnits = ComputeBudgetProgram.setComputeUnitLimit({
      units: 400_000,
    });

    const addPriorityFee = ComputeBudgetProgram.setComputeUnitPrice({
      microLamports: COMPUTE_UNIT_PRICE,
    });
    tx.add(modifyComputeUnits, addPriorityFee, addFeesIx);

    return tx;
  }

  public async addFeesToAmmPool(
    ammPool: AmmPool,
    staking: StakingPoolClientV2,
    tokenInfoA: TokenInfo,
    tokenInfoB: TokenInfo,
    client: MemechanClientV2,
    payer: Keypair,
  ) {
    const { createProgram, deriveLockEscrowPda, derivePoolAddress, getAssociatedTokenAccount } = await import(
      "@mercurial-finance/dynamic-amm-sdk/dist/cjs/src/amm/utils"
    );
    const { default: VaultImpl, getVaultPdas } = await import("@mercurial-finance/vault-sdk");
    const tradeFeeBps = new BN(100);
    const connection = client.connection;
    const { vaultProgram, ammProgram } = createProgram(connection);

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
        connection,
        payer.publicKey,
        tokenInfoA.toSplTokenInfo(),
      );
      createVaultAIx && preInstructions.push(createVaultAIx);
    } else {
      aVaultLpMint = aVaultAccount.lpMint; // Old vault doesn't have lp mint pda
    }
    if (!bVaultAccount) {
      const createVaultBIx = await VaultImpl.createPermissionlessVaultInstruction(
        connection,
        payer.publicKey,
        tokenInfoB.toSplTokenInfo(),
      );
      createVaultBIx && preInstructions.push(createVaultBIx);
    } else {
      bVaultLpMint = bVaultAccount.lpMint; // Old vault doesn't have lp mint pda
    }

    console.log("2");

    const poolPubkey = derivePoolAddress(
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

    // const [[adminTokenAFee], [adminTokenBFee]] = [
    //   PublicKey.findProgramAddressSync(
    //     [Buffer.from(SEEDS.FEE), tokenAMint.toBuffer(), poolPubkey.toBuffer()],
    //     ammProgram.programId,
    //   ),
    //   PublicKey.findProgramAddressSync(
    //     [Buffer.from(SEEDS.FEE), tokenBMint.toBuffer(), poolPubkey.toBuffer()],
    //     ammProgram.programId,
    //   ),
    // ];

    console.log("4");
    const { SEEDS } = await import("@mercurial-finance/dynamic-amm-sdk/dist/cjs/src/amm/constants");
    const [lpMint] = PublicKey.findProgramAddressSync(
      [Buffer.from(SEEDS.LP_MINT), poolPubkey.toBuffer()],
      ammProgram.programId,
    );

    // const [mintMetadata, _mintMetadataBump] = deriveMintMetadata(lpMint);

    const stakingSigner = this.findSignerPda();

    const [lockEscrowPK] = deriveLockEscrowPda(poolPubkey, stakingSigner, ammProgram.programId);

    console.log("5");
    preInstructions = [];

    const payerPoolLp = await getAssociatedTokenAccount(lpMint, stakingSigner);

    const escrowAta = await getAssociatedTokenAccount(lpMint, lockEscrowPK);
    console.log(escrowAta);
    const { TOKEN_PROGRAM_ID, getOrCreateAssociatedTokenAccount } = await import("@solana/spl-token");
    const memeFeeVault = (
      await getOrCreateAssociatedTokenAccount(connection, payer, tokenAMint, new PublicKey(LP_FEE_WALLET))
    ).address;
    const quoteFeeVault = (
      await getOrCreateAssociatedTokenAccount(connection, payer, tokenBMint, new PublicKey(LP_FEE_WALLET))
    ).address;

    const quoteVault =
      tokenInfoB.mint === TOKEN_INFOS.CHAN.mint ? staking.poolObjectData.chanVault : staking.poolObjectData.quoteVault;

    console.log("7");

    const addFeesIx = await client.memechanProgram.methods
      .addFees()
      .accounts({
        memeFeeVault,
        quoteFeeVault,
        ammPool: ammPool.id,
        aTokenVault,
        aVault,
        aVaultLp,
        aVaultLpMint,
        bTokenVault,
        bVault,
        bVaultLp,
        bVaultLpMint,
        escrowVault: escrowAta,
        lockEscrow: lockEscrowPK,
        lpMint,
        memeMint: staking.memeMint,
        memeVault: staking.memeVault,
        quoteMint: tokenBMint,
        quoteVault,
        signer: payer.publicKey,
        sourceTokens: payerPoolLp,
        staking: this.id,
        stakingSignerPda: stakingSigner,
        ammProgram: ammProgram.programId,
        vaultProgram: vaultProgram.programId,
        tokenProgram: TOKEN_PROGRAM_ID,
        memoProgram: MEMO_PROGRAM_ID,
      })
      .signers([payer])
      .instruction();

    const addPriorityFee = ComputeBudgetProgram.setComputeUnitPrice({
      microLamports: COMPUTE_UNIT_PRICE,
    });
    const tx = new Transaction().add(addPriorityFee, addFeesIx);
    const addFeesTxResult = await sendAndConfirmTransaction(client.connection, tx, [payer], {
      commitment: "confirmed",
      preflightCommitment: "confirmed",
      skipPreflight: true,
    });

    console.log("addFeesTxResult: ", addFeesTxResult);
  }

  public async addFees({ payer, ammPoolId }: AddFeesArgs): Promise<void> {
    const addFeesTransaction = await this.getAddFeesTransaction({ payer: payer.publicKey, ammPoolId });

    const sendAndConfirmAddFeesTransaction = getSendAndConfirmTransactionMethod({
      connection: this.client.connection,
      signers: [payer],
      transaction: addFeesTransaction,
    });

    await retry({
      fn: sendAndConfirmAddFeesTransaction,
      functionName: "addFees",
      retries: 1,
    });
  }

  public async getUnstakeTransaction(args: GetUnstakeTransactionArgsV2): Promise<Transaction> {
    const tx = args.transaction ?? new Transaction();
    const stakingInfo = await this.fetch();
    const user = args.user;
    const { getAccount, TOKEN_PROGRAM_ID } = await import("@solana/spl-token");
    const quoteAccount = await getAccount(this.client.connection, stakingInfo.quoteVault);

    const associatedMemeTokenAddress = await ensureAssociatedTokenAccountWithIdempotentIX({
      connection: this.client.connection,
      payer: user,
      mint: stakingInfo.memeMint,
      owner: user,
      transaction: tx,
    });
    const associatedQuoteTokenAddress = await ensureAssociatedTokenAccountWithIdempotentIX({
      connection: this.client.connection,
      payer: user,
      mint: quoteAccount.mint,
      owner: user,
      transaction: tx,
    });

    const chanAccountPublicKey = await ensureAssociatedTokenAccountWithIdempotentIX({
      connection: this.client.connection,
      payer: args.user,
      mint: TOKEN_INFOS.CHAN.mint,
      owner: args.user,
      transaction: tx,
    });

    const unstakeInstruction = await this.client.memechanProgram.methods
      .unstake(args.amount)
      .accounts({
        memeTicket: args.ticket.id,
        signer: args.user,
        stakingSignerPda: this.findSignerPda(),
        memeVault: stakingInfo.memeVault,
        quoteVault: stakingInfo.quoteVault,
        staking: this.id,
        userMeme: associatedMemeTokenAddress,
        userQuote: associatedQuoteTokenAddress,
        userChan: chanAccountPublicKey,
        chanVault: stakingInfo.chanVault,
        tokenProgram: TOKEN_PROGRAM_ID,
      })
      .instruction();

    tx.add(unstakeInstruction);

    addUnwrapSOLInstructionIfNativeMint(quoteAccount.mint, user, tx);

    return tx;
  }

  public async getPreparedUnstakeTransactions({
    amount,
    ticketIds,
    user,
    transaction,
  }: GetPreparedUnstakeTransactionsArgs): Promise<Transaction[]> {
    const tx = transaction ?? new Transaction();

    /**
     * Adding add fees instructions.
     * WARNING: `tx` mutation below.
     */
    // await this.getAddFeesTransaction({ ammPoolId, payer: user, transaction: tx });

    const addPriorityFee = ComputeBudgetProgram.setComputeUnitPrice({
      microLamports: COMPUTE_UNIT_PRICE,
    });
    tx.add(addPriorityFee);

    // WARNING: `tx` mutation below
    const destinationMemeTicket = await this.prepareTransactionWithStakingTicketsMerge({
      ticketIds,
      transaction: tx,
      user,
    });

    // WARNING: `tx` mutation below
    await this.getUnstakeTransaction({
      amount,
      ticket: destinationMemeTicket,
      user,
      transaction: tx,
    });

    // const optimizedTransactions = getOptimizedTransactions(tx.instructions, user);

    return [tx];
  }

  public async unstake(args: UnstakeArgsV2): Promise<string> {
    const transaction = await this.getUnstakeTransaction({
      ...args,
      user: args.user.publicKey,
    });

    const signature = await sendAndConfirmTransaction(this.client.connection, transaction, [args.user], {
      commitment: "confirmed",
      skipPreflight: true,
      preflightCommitment: "confirmed",
    });
    console.log("unstake signature:", signature);

    return signature;
  }

  public async getAvailableUnstakeAmount({
    tickets,
    stakingPoolVestingConfig,
  }: GetAvailableUnstakeAmountArgs): Promise<string> {
    const { cliffTs, endTs } = stakingPoolVestingConfig;
    const currentTimeInMs = Date.now();
    const cliffTsInMs = new BigNumber(cliffTs.toString()).multipliedBy(1_000);
    const endTsInMs = new BigNumber(endTs.toString()).multipliedBy(1_000);

    const notionalTotalBN = tickets.reduce((acc: BN, curr) => acc.add(curr.vesting.notional), new BN(0));
    const releasedTotalBN = tickets.reduce((acc: BN, curr) => acc.add(curr.vesting.released), new BN(0));

    const notionalTotal = new BigNumber(notionalTotalBN.toString());
    const releasedTotal = new BigNumber(releasedTotalBN.toString());

    // Initial 10% release
    const initialReleasePercent = new BigNumber(0.1);
    const initialReleaseAmount = notionalTotal.multipliedBy(initialReleasePercent).integerValue(BigNumber.ROUND_DOWN);

    if (currentTimeInMs < cliffTsInMs.toNumber()) {
      // Before the cliff, only the initial 10% is available
      const availableUnstakeAmount = initialReleaseAmount.minus(releasedTotal).toFixed(0);
      return availableUnstakeAmount;
    }

    const unlockDurationInMs = endTsInMs.minus(cliffTsInMs);
    const unlockProgressInMs = new BigNumber(currentTimeInMs).minus(cliffTsInMs);
    const unlockProgressInAbsolutePercent = new BigNumber(unlockProgressInMs).div(unlockDurationInMs).toNumber();

    // Linear vesting part is over
    if (new BigNumber(currentTimeInMs).gte(endTsInMs)) {
      const availableUnstakeAmount = notionalTotal.minus(releasedTotal).toFixed(0);
      return availableUnstakeAmount;
    }

    // Extra safety net in case unlock progress is less than zero
    const unlockProgressWithLowerBound = Math.max(unlockProgressInAbsolutePercent, 0);

    // Calculated unlock progress can be greater than 1, when it is already over
    const unlockProgressWithUpperBound = Math.min(unlockProgressWithLowerBound, 1);

    // Calculate the linear unlocked amount based on the remaining notional total after initial release
    const remainingNotionalTotal = notionalTotal.minus(initialReleaseAmount);
    const linearUnlockAmount = remainingNotionalTotal
      .multipliedBy(unlockProgressWithUpperBound)
      .integerValue(BigNumber.ROUND_DOWN);

    // Total available amount is the initial release amount plus the linear unlocked amount
    const totalAvailableAmount = initialReleaseAmount.plus(linearUnlockAmount);

    // Unstake amount must be bignumerish, so `toFixed(0)`
    const availableUnstakeAmount = totalAvailableAmount.minus(releasedTotal).toFixed(0);

    return availableUnstakeAmount;
  }

  public async getWithdrawFeesTransaction(args: GetWithdrawFeesTransactionArgsV2): Promise<Transaction> {
    const tx = args.transaction ?? new Transaction();
    const stakingInfo = await this.fetch();

    const memeAccountPublicKey = await ensureAssociatedTokenAccountWithIdempotentIX({
      connection: this.client.connection,
      payer: args.user,
      mint: stakingInfo.memeMint,
      owner: args.user,
      transaction: tx,
    });
    const { getAccount, TOKEN_PROGRAM_ID } = await import("@solana/spl-token");
    const quoteAccount = await getAccount(this.client.connection, stakingInfo.quoteVault);

    const quoteAccountPublicKey = await ensureAssociatedTokenAccountWithIdempotentIX({
      connection: this.client.connection,
      payer: args.user,
      mint: quoteAccount.mint,
      owner: args.user,
      transaction: tx,
    });

    const chanAccountPublicKey = await ensureAssociatedTokenAccountWithIdempotentIX({
      connection: this.client.connection,
      payer: args.user,
      mint: TOKEN_INFOS.CHAN.mint,
      owner: args.user,
      transaction: tx,
    });

    const withdrawFeesInstruction = await this.client.memechanProgram.methods
      .withdrawFees()
      .accounts({
        memeTicket: args.ticket.id,
        stakingSignerPda: this.findSignerPda(),
        memeVault: stakingInfo.memeVault,
        quoteVault: stakingInfo.quoteVault,
        staking: this.id,
        userMeme: memeAccountPublicKey,
        userQuote: quoteAccountPublicKey,
        userChan: chanAccountPublicKey,
        chanVault: stakingInfo.chanVault,
        signer: args.user,
        tokenProgram: TOKEN_PROGRAM_ID,
      })
      .instruction();

    tx.add(withdrawFeesInstruction);

    addUnwrapSOLInstructionIfNativeMint(quoteAccount.mint, args.user, tx);

    return tx;
  }

  public async getPreparedWithdrawFeesTransactions({
    ticketIds,
    user,
    transaction,
  }: GetPreparedWithdrawFeesTransactionsArgs): Promise<Transaction[]> {
    const tx = transaction ?? new Transaction();

    /**
     * Adding add fees instructions.
     * WARNING: `tx` mutation below.
     */
    // await this.getAddFeesTransaction({ ammPoolId, payer: user, transaction: tx });

    const addPriorityFee = ComputeBudgetProgram.setComputeUnitPrice({
      microLamports: COMPUTE_UNIT_PRICE,
    });
    tx.add(addPriorityFee);

    // WARNING: `tx` mutation below
    const destinationMemeTicket = await this.prepareTransactionWithStakingTicketsMerge({
      ticketIds,
      transaction: tx,
      user,
    });

    // WARNING: `tx` mutation below
    await this.getWithdrawFeesTransaction({
      ticket: destinationMemeTicket,
      user,
      transaction: tx,
    });

    // const optimizedTransactions = getOptimizedTransactions(tx.instructions, user);

    return [tx];
  }

  public async withdrawFees(args: WithdrawFeesArgsV2) {
    const transaction = await this.getWithdrawFeesTransaction({
      ...args,
      user: args.user.publicKey,
    });

    const sendAndConfirmWithdrawFeesTransaction = getSendAndConfirmTransactionMethod({
      connection: this.client.connection,
      signers: [args.user],
      transaction,
    });

    await retry({
      fn: sendAndConfirmWithdrawFeesTransaction,
      functionName: "withdrawFees",
    });
  }

  public async getAvailableWithdrawFeesAmount({
    tickets,
  }: getAvailableWithdrawFeesAmountArgsV2): Promise<{ memeFees: string; quoteFees: string; chanFees: string }> {
    const stakedAmount = tickets.reduce((staked, { vesting: { notional, released } }) => {
      const notionalString = notional.toString();
      const releasedString = released.toString();
      const rest = new BigNumber(notionalString).minus(releasedString);

      return staked.plus(rest);
    }, new BigNumber(0));

    const stakingPoolData = await StakingPool.fetch(this.client.connection, this.id);

    if (!stakingPoolData) {
      throw new Error(`[getAvailableWithdrawFeesAmount] Failed to fetch staking pool data for ${this.id.toString()}.`);
    }

    const totalStaked = stakingPoolData.stakesTotal.toString();
    const userStakePart = new BigNumber(stakedAmount).div(totalStaked);
    const fullMemeFeesPart = new BigNumber(stakingPoolData.feesXTotal.toString()).multipliedBy(userStakePart);
    const fullQuoteFeesPart = new BigNumber(stakingPoolData.feesYTotal.toString()).multipliedBy(userStakePart);
    const fullChanFeesPart = new BigNumber(stakingPoolData.feesZTotal.toString()).multipliedBy(userStakePart);

    const { memeFees, quoteFees, chanFees } = tickets.reduce(
      ({ memeFees, quoteFees, chanFees }, ticket) => {
        const { withdrawsMeme, withdrawsQuote, withdrawsChan } = ticket;

        memeFees = memeFees.minus(withdrawsMeme.toString());
        quoteFees = quoteFees.minus(withdrawsQuote.toString());
        chanFees = chanFees.minus(withdrawsChan.toString());

        return { memeFees, quoteFees, chanFees };
      },
      { memeFees: fullMemeFeesPart, quoteFees: fullQuoteFeesPart, chanFees: fullChanFeesPart },
    );

    return {
      memeFees: memeFees.multipliedBy(0.9999).toFixed(0),
      quoteFees: quoteFees.multipliedBy(0.9999).toFixed(0),
      chanFees: chanFees.multipliedBy(0.9999).toFixed(0),
    };
  }

  /**
   * @returns A destination meme ticket.
   */
  public async prepareTransactionWithStakingTicketsMerge({
    transaction,
    user,
    ticketIds,
  }: PrepareTransactionWithStakingTicketsMergeArgs): Promise<MemeTicketClientV2> {
    const [destinationTicketId, ...sourceTicketIds] = ticketIds;
    const destinationMemeTicket = new MemeTicketClientV2(destinationTicketId, this.client);

    if (sourceTicketIds.length > 0) {
      const sourceMemeTickets = sourceTicketIds.map((ticketId) => ({ id: ticketId }));

      // WARNING: `transaction` mutation below
      await destinationMemeTicket.getStakingMergeTransaction({
        staking: this.id,
        ticketsToMerge: sourceMemeTickets,
        user,
        transaction,
      });

      console.log("[prepareTransactionWithStakingTicketsMerge] All the tickets are merged.");
    } else {
      console.log("[prepareTransactionWithStakingTicketsMerge] Nothing to merge, only one ticket available.");
    }

    return destinationMemeTicket;
  }

  public async getHoldersCount() {
    return StakingPoolClientV2.getHoldersCount(this.pool, this.memeMint, this.client);
  }

  public async getHoldersList() {
    return StakingPoolClientV2.getHoldersList(this.pool, this.memeMint, this.client);
  }

  /**
   * Fetches all tickets for corresponding pool id
   */
  public async fetchRelatedTickets(pool = this.pool, client = this.client): Promise<MemeTicketFields[]> {
    return MemeTicketClientV2.fetchRelatedTickets(pool, client);
  }

  public async getTokenInfo(): Promise<TokenInfo> {
    const { getAccount } = await import("@solana/spl-token");
    const quoteAccount = await getAccount(this.client.connection, this.quoteVault);
    return getTokenInfoByMint(quoteAccount.mint);
  }

  /**
   * Fetches all unique token holders and memetickets owners for pool; then returns their number
   */
  public static async getHoldersCount(pool: PublicKey, mint: PublicKey, client: MemechanClientV2) {
    return (await StakingPoolClientV2.getHoldersList(pool, mint, client)).length;
  }

  /**
   * Fetches all unique token holders and memetickets owners for pool; then returns thier addresses
   *
   * @throws an error if `client.heliusApiUrl` is not provided to the MemechanClient or empty
   */
  public static async getHoldersList(
    boundPool: PublicKey,
    mint: PublicKey,
    client: MemechanClientV2,
  ): Promise<
    [
      { address: string; tokenAmount: BigNumber; tokenAmountInPercentage: BigNumber }[],
      { address: string; amount: BigNumber },
    ]
  > {
    if (!client.heliusApiUrl) {
      console.warn(`[getHoldersList] is empty: ${client.heliusApiUrl}`);
      throw new Error("[getHoldersList] Fetching holders is only possible if heliusApiUrl is provided and non-empty.");
    }

    const stakingId = BoundPoolClientV2.findStakingPda(mint, client.memechanProgram.programId);
    const stakingPDA = StakingPoolClientV2.findSignerPda(stakingId, client.memechanProgram.programId).toBase58();

    const ticketHolderList = await BoundPoolClientV2.getHoldersMap(boundPool, client);
    const [tokenHolderList, stakingTokens] = await StakingPoolClientV2.getTokenHolderListHelius(
      mint,
      stakingPDA,
      client.heliusApiUrl,
    );

    const aggregatedHolderAmounts: Map<string, BigNumber> = new Map();

    ticketHolderList.forEach((ticketFields: MemeTicketFields[], holder: string) => {
      let accumulator = new BigNumber(0);
      ticketFields.forEach((ticket) => {
        accumulator = accumulator.plus(ticket.vesting.notional.sub(ticket.vesting.released).toString());
      });

      aggregatedHolderAmounts.set(holder, accumulator);
    });

    tokenHolderList.forEach((amount: BigNumber, holder: string) => {
      const current = aggregatedHolderAmounts.get(holder) ?? new BigNumber(0);
      aggregatedHolderAmounts.set(holder, current.plus(amount));
    });

    const aggregatedHoldersList: { address: string; tokenAmount: BigNumber; tokenAmountInPercentage: BigNumber }[] = [];
    aggregatedHolderAmounts.forEach((amount: BigNumber, holder: string) => {
      aggregatedHoldersList.push({
        address: holder,
        tokenAmount: amount,
        tokenAmountInPercentage: amount.div(new BigNumber(MAX_MEME_TOKENS * MEME_TOKEN_DECIMALS)).multipliedBy(100),
      });
    });

    return [aggregatedHoldersList, { address: stakingPDA, amount: stakingTokens }];
  }

  public static async getTokenHolderListHelius(
    mint: PublicKey,
    stakingPDA: string,
    url: string,
  ): Promise<[Map<string, BigNumber>, BigNumber]> {
    let page = 1;
    const allOwners: Map<string, BigNumber> = new Map();
    let stakingLockedTokens = new BigNumber(0);

    // eslint-disable-next-line no-constant-condition
    while (true) {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          jsonrpc: "2.0",
          method: "getTokenAccounts",
          id: "staking-get-token-holders",
          params: {
            page: page,
            limit: 1000,
            displayOptions: {},
            mint: mint.toBase58(),
          },
        }),
      });
      const data = await response.json();
      if (!data.result || data.result.token_accounts.length === 0) {
        break;
      }

      data.result.token_accounts.forEach((account: { owner: string; amount: BigNumber }) => {
        if (account.owner === stakingPDA) {
          stakingLockedTokens = account.amount;
        } else {
          const current = allOwners.get(account.owner) ?? new BigNumber(0);
          allOwners.set(account.owner, current.plus(account.amount));
        }
      });
      page++;
    }

    return [allOwners, stakingLockedTokens];
  }

  private async fetch(program = this.client.memechanProgram) {
    return program.account.stakingPool.fetch(this.id, "confirmed");
  }

  public static async all(client: MemechanClientV2): Promise<{ account: StakingPoolFields; publicKey: PublicKey }[]> {
    const rawPools = await client.memechanProgram.account.stakingPool.all();
    const pools = rawPools.map((el) => el);
    return pools;
  }

  public findSignerPda(): PublicKey {
    return StakingPoolClientV2.findSignerPda(this.id, this.client.memechanProgram.programId);
  }

  private getAccountMeta(pubkey: PublicKey): AccountMeta {
    return { isSigner: false, isWritable: true, pubkey };
  }

  /**
   * Checks if an (AMM) pool is created for the provided memecoin mint.
   *
   * The method returns `false` in two cases:
   * 1. When there is no staking pool at all (i.e., the staking pool is not created yet).
   * 2. When there is a staking pool but the AMM pool is not created yet.
   *
   * @param {Object} params - The parameters for the method.
   * @param {Connection} params.connection - The connection to the Solana cluster.
   * @param {PublicKey} params.memeMintPubkey - The public key of the memecoin mint.
   *
   * @returns {Promise<boolean>} - A promise that resolves to a boolean indicating whether the AMM pool is created.
   *
   * @throws {Error} - If the RPC (network) call to fetch the staking pool information fails.
   */
  public static async isAmmPoolIsCreated({
    connection,
    memeMintPubkey,
  }: {
    connection: Connection;
    memeMintPubkey: PublicKey;
  }): Promise<boolean> {
    const memechanProgramPubkey = new PublicKey(MEMECHAN_PROGRAM_ID_V2);
    const stakingPda = BoundPoolClientV2.findStakingPda(memeMintPubkey, memechanProgramPubkey);
    const stakingInfo = await StakingPool.fetch(connection, stakingPda);

    // if there is no staking pool, than there is no amm pool obviously
    if (!stakingInfo) {
      console.warn(
        `[isAmmPoolIsCreated] No staking pool found for current memeMintPubkey ${memeMintPubkey.toString()}`,
      );

      return false;
    }

    const { quoteAmmPool, chanAmmPool } = stakingInfo;
    const isQuoteAmmIsEqualToSystemProgramId = quoteAmmPool.equals(SystemProgram.programId);
    const isChanAmmIsEqualToSystemProgramId = chanAmmPool.equals(SystemProgram.programId);
    const isPoolCreated = !isQuoteAmmIsEqualToSystemProgramId && !isChanAmmIsEqualToSystemProgramId;

    return isPoolCreated;
  }
}
