import {
  AccountInfo,
  AccountMeta,
  Connection,
  PublicKey,
  SystemProgram,
  Transaction,
  sendAndConfirmTransaction,
} from "@solana/web3.js";
import BigNumber from "bignumber.js";
import BN from "bn.js";
import { MemechanClient } from "../MemechanClient";
import { BoundPoolClient } from "../bound-pool/BoundPoolClient";
import { MAX_MEME_TOKENS, MEMECHAN_PROGRAM_ID, MEME_TOKEN_DECIMALS } from "../config/config";
import { MemeTicketClient } from "../memeticket/MemeTicketClient";
import { getOptimizedTransactions } from "../memeticket/utils";
import { formatAmmKeysById } from "../raydium/formatAmmKeysById";
import { MemeTicketFields, StakingPool, StakingPoolFields } from "../schema/codegen/accounts";
import { ensureAssociatedTokenAccountWithIdempotentIX } from "../util/ensureAssociatedTokenAccountWithIdempotentIX";
import { getSendAndConfirmTransactionMethod } from "../util/getSendAndConfirmTransactionMethod";
import { retry } from "../util/retry";
import {
  AddFeesArgs,
  GetAddFeesTransactionArgs,
  GetAvailableUnstakeAmountArgs,
  GetPreparedUnstakeTransactionsArgs,
  GetPreparedWithdrawFeesTransactionsArgs,
  GetUnstakeTransactionArgs,
  GetWithdrawFeesTransactionArgs,
  PrepareTransactionWithStakingTicketsMergeArgs,
  UnstakeArgs,
  WithdrawFeesArgs,
  getAvailableWithdrawFeesAmountArgs,
} from "./types";
import { addUnwrapSOLInstructionIfNativeMint } from "../util/addUnwrapSOLInstructionIfNativeMint";
import { getTokenInfoByMint } from "../config/helpers";
import { TokenInfo } from "../config/types";

export class StakingPoolClient {
  constructor(
    public id: PublicKey,
    private client: MemechanClient,
    public pool: PublicKey,
    public memeVault: PublicKey,
    public memeMint: PublicKey,
    public lpVault: PublicKey,
    public lpMint: PublicKey,
    public quoteVault: PublicKey,
    public raydiumAmm: PublicKey,
    public poolObjectData: StakingPool,
  ) {}

  public static async fromStakingPoolId({
    client,
    poolAccountAddressId,
  }: {
    client: MemechanClient;
    poolAccountAddressId: PublicKey;
  }) {
    const stakingPoolObjectData = await StakingPool.fetch(client.connection, poolAccountAddressId);

    if (!stakingPoolObjectData) {
      throw new Error(`[fromStakingPoolId] Staking pool data is not found for ${poolAccountAddressId.toString()}.`);
    }

    const boundClientInstance = new StakingPoolClient(
      poolAccountAddressId,
      client,
      stakingPoolObjectData.pool,
      stakingPoolObjectData.memeVault,
      stakingPoolObjectData.memeMint,
      stakingPoolObjectData.lpVault,
      stakingPoolObjectData.lpMint,
      stakingPoolObjectData.quoteVault,
      stakingPoolObjectData.raydiumAmm,
      stakingPoolObjectData,
    );

    return boundClientInstance;
  }

  public static fromAccountInfo({
    client,
    poolAccountAddressId,
    accountInfo,
  }: {
    client: MemechanClient;
    poolAccountAddressId: PublicKey;
    accountInfo: AccountInfo<Buffer>;
  }) {
    const stakingPoolObjectData = StakingPool.decode(accountInfo.data);

    if (!stakingPoolObjectData) {
      throw new Error(`[fromStakingPoolId] Staking pool data is not found for ${poolAccountAddressId.toString()}.`);
    }

    const boundClientInstance = new StakingPoolClient(
      poolAccountAddressId,
      client,
      stakingPoolObjectData.pool,
      stakingPoolObjectData.memeVault,
      stakingPoolObjectData.memeMint,
      stakingPoolObjectData.lpVault,
      stakingPoolObjectData.lpMint,
      stakingPoolObjectData.quoteVault,
      stakingPoolObjectData.raydiumAmm,
      stakingPoolObjectData,
    );

    return boundClientInstance;
  }

  public async fromStakingPoolId() {
    if (!this.poolObjectData) {
      throw new Error(`[fromStakingPoolId] Staking pool data is not found for ${this.pool.toString()}.`);
    }

    const boundClientInstance = new StakingPoolClient(
      this.pool,
      this.client,
      this.poolObjectData.pool,
      this.poolObjectData.memeVault,
      this.poolObjectData.memeMint,
      this.poolObjectData.lpVault,
      this.poolObjectData.lpMint,
      this.poolObjectData.quoteVault,
      this.poolObjectData.raydiumAmm,
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
    const stakingInfo = await this.fetch();

    const ammPool = await formatAmmKeysById(args.ammPoolId.toBase58(), this.client.connection);

    const stakingSignerPda = this.findSignerPda();
    const { TOKEN_PROGRAM_ID } = await import("@solana/spl-token");
    const addFeesInstruction = await this.client.memechanProgram.methods
      .addFees()
      .accounts({
        memeVault: stakingInfo.memeVault,
        quoteVault: stakingInfo.quoteVault,
        staking: this.id,
        stakingSignerPda: stakingSignerPda,
        tokenProgram: TOKEN_PROGRAM_ID,
        marketAccount: ammPool.marketId,
        marketAsks: ammPool.marketAsks,
        marketBids: ammPool.marketBids,
        marketEventQueue: ammPool.marketEventQueue,
        marketCoinVault: ammPool.marketBaseVault,
        marketPcVault: ammPool.marketQuoteVault,
        marketProgramId: ammPool.marketProgramId,
        marketVaultSigner: ammPool.marketAuthority,
        openOrders: ammPool.openOrders,
        raydiumAmm: ammPool.id,
        raydiumAmmAuthority: ammPool.authority,
        raydiumLpMint: ammPool.lpMint,
        raydiumMemeVault: ammPool.baseVault,
        raydiumQuoteVault: ammPool.quoteVault,
        signer: payer,
        targetOrders: ammPool.targetOrders,
        stakingLpWallet: this.lpVault,
        raydiumProgram: ammPool.programId,
      })
      .instruction();

    tx.add(addFeesInstruction);

    return tx;
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

  public async getUnstakeTransaction(args: GetUnstakeTransactionArgs): Promise<Transaction> {
    const tx = args.transaction ?? new Transaction();
    const stakingInfo = await this.fetch();
    const user = args.user;
    const { getAccount } = await import("@solana/spl-token");
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
    const { TOKEN_PROGRAM_ID } = await import("@solana/spl-token");
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
        tokenProgram: TOKEN_PROGRAM_ID,
      })
      .instruction();

    tx.add(unstakeInstruction);

    addUnwrapSOLInstructionIfNativeMint(quoteAccount.mint, user, tx);

    return tx;
  }

  public async getPreparedUnstakeTransactions({
    ammPoolId,
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
    await this.getAddFeesTransaction({ ammPoolId, payer: user, transaction: tx });

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

    const optimizedTransactions = getOptimizedTransactions(tx.instructions, user);

    return optimizedTransactions;
  }

  public async unstake(args: UnstakeArgs): Promise<string> {
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

    // If linear unlock didn't start yet, return 0
    if (cliffTsInMs.gt(currentTimeInMs)) {
      return "0";
    }

    const notionalTotalBN = tickets.reduce((acc: BN, curr) => acc.add(curr.vesting.notional), new BN(0));
    const releasedTotalBN = tickets.reduce((acc: BN, curr) => acc.add(curr.vesting.released), new BN(0));

    const notionalTotal = new BigNumber(notionalTotalBN.toString());
    const releasedTotal = new BigNumber(releasedTotalBN.toString());

    const unlockDurationInMs = endTsInMs.minus(cliffTsInMs);
    const unlockProgressInMs = new BigNumber(currentTimeInMs).minus(cliffTsInMs);
    const unlockProgressInAbsolutePercent = new BigNumber(unlockProgressInMs).div(unlockDurationInMs).toNumber();

    // Extra safety net in case unlock progress is less than zero
    const unlockProgressWithLowerBound = Math.max(unlockProgressInAbsolutePercent, 0);

    // Calculated unlock progress can be greater than 1, when it is already over
    const unlockProgressWithUpperBound = Math.min(unlockProgressWithLowerBound, 1);

    // Unstake amount must be bignumerish, so `toFixed(0)`
    const availableUnstakeAmount = notionalTotal
      .multipliedBy(unlockProgressWithUpperBound)
      .minus(releasedTotal)
      .toFixed(0);

    return availableUnstakeAmount;
  }

  public async getWithdrawFeesTransaction(args: GetWithdrawFeesTransactionArgs): Promise<Transaction> {
    const tx = args.transaction ?? new Transaction();
    const stakingInfo = await this.fetch();

    const memeAccountPublicKey = await ensureAssociatedTokenAccountWithIdempotentIX({
      connection: this.client.connection,
      payer: args.user,
      mint: stakingInfo.memeMint,
      owner: args.user,
      transaction: tx,
    });
    const { TOKEN_PROGRAM_ID, getAccount } = await import("@solana/spl-token");
    const quoteAccount = await getAccount(this.client.connection, stakingInfo.quoteVault);

    const quoteAccountPublicKey = await ensureAssociatedTokenAccountWithIdempotentIX({
      connection: this.client.connection,
      payer: args.user,
      mint: quoteAccount.mint,
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
        signer: args.user,
        tokenProgram: TOKEN_PROGRAM_ID,
      })
      .instruction();

    tx.add(withdrawFeesInstruction);

    addUnwrapSOLInstructionIfNativeMint(quoteAccount.mint, args.user, tx);

    return tx;
  }

  public async getPreparedWithdrawFeesTransactions({
    ammPoolId,
    ticketIds,
    user,
    transaction,
  }: GetPreparedWithdrawFeesTransactionsArgs): Promise<Transaction[]> {
    const tx = transaction ?? new Transaction();

    /**
     * Adding add fees instructions.
     * WARNING: `tx` mutation below.
     */
    await this.getAddFeesTransaction({ ammPoolId, payer: user, transaction: tx });

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

    const optimizedTransactions = getOptimizedTransactions(tx.instructions, user);

    return optimizedTransactions;
  }

  public async withdrawFees(args: WithdrawFeesArgs) {
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
  }: getAvailableWithdrawFeesAmountArgs): Promise<{ memeFees: string; slerfFees: string }> {
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
    const fullSlerfFeesPart = new BigNumber(stakingPoolData.feesYTotal.toString()).multipliedBy(userStakePart);

    const { memeFees, slerfFees } = tickets.reduce(
      ({ memeFees, slerfFees }, ticket) => {
        const { withdrawsMeme, withdrawsQuote } = ticket;

        memeFees = memeFees.minus(withdrawsMeme.toString());
        slerfFees = slerfFees.minus(withdrawsQuote.toString());

        return { memeFees, slerfFees };
      },
      { memeFees: fullMemeFeesPart, slerfFees: fullSlerfFeesPart },
    );

    return { memeFees: memeFees.multipliedBy(0.9999).toFixed(0), slerfFees: slerfFees.multipliedBy(0.9999).toFixed(0) };
  }

  /**
   * @returns A destination meme ticket.
   */
  public async prepareTransactionWithStakingTicketsMerge({
    transaction,
    user,
    ticketIds,
  }: PrepareTransactionWithStakingTicketsMergeArgs): Promise<MemeTicketClient> {
    const [destinationTicketId, ...sourceTicketIds] = ticketIds;
    const destinationMemeTicket = new MemeTicketClient(destinationTicketId, this.client);

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
    return StakingPoolClient.getHoldersCount(this.pool, this.memeMint, this.client);
  }

  public async getHoldersList() {
    return StakingPoolClient.getHoldersList(this.pool, this.memeMint, this.client);
  }

  /**
   * Fetches all tickets for corresponding pool id
   */
  public async fetchRelatedTickets(pool = this.pool, client = this.client): Promise<MemeTicketFields[]> {
    return MemeTicketClient.fetchRelatedTickets(pool, client);
  }

  public async getTokenInfo(): Promise<TokenInfo> {
    const { getAccount } = await import("@solana/spl-token");
    const quoteAccount = await getAccount(this.client.connection, this.quoteVault);
    return getTokenInfoByMint(quoteAccount.mint);
  }

  /**
   * Fetches all unique token holders and memetickets owners for pool; then returns their number
   */
  public static async getHoldersCount(pool: PublicKey, mint: PublicKey, client: MemechanClient) {
    return (await StakingPoolClient.getHoldersList(pool, mint, client)).length;
  }

  /**
   * Fetches all unique token holders and memetickets owners for pool; then returns thier addresses
   *
   * @throws an error if `client.heliusApiUrl` is not provided to the MemechanClient or empty
   */
  public static async getHoldersList(
    boundPool: PublicKey,
    mint: PublicKey,
    client: MemechanClient,
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

    const stakingId = BoundPoolClient.findStakingPda(mint, client.memechanProgram.programId);
    const stakingPDA = StakingPoolClient.findSignerPda(stakingId, client.memechanProgram.programId).toBase58();

    const ticketHolderList = await BoundPoolClient.getHoldersMap(boundPool, client);
    const [tokenHolderList, stakingTokens] = await StakingPoolClient.getTokenHolderListHelius(
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

  public static async all(client: MemechanClient): Promise<{ account: StakingPoolFields; publicKey: PublicKey }[]> {
    const rawPools = await client.memechanProgram.account.stakingPool.all();
    const pools = rawPools.map((el) => el);
    return pools;
  }

  public findSignerPda(): PublicKey {
    return StakingPoolClient.findSignerPda(this.id, this.client.memechanProgram.programId);
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
    const memechanProgramPubkey = new PublicKey(MEMECHAN_PROGRAM_ID);
    const stakingPda = BoundPoolClient.findStakingPda(memeMintPubkey, memechanProgramPubkey);
    const stakingInfo = await StakingPool.fetch(connection, stakingPda);

    // if there is no staking pool, than there is no amm pool obviously
    if (!stakingInfo) {
      console.warn(
        `[isAmmPoolIsCreated] No staking pool found for current memeMintPubkey ${memeMintPubkey.toString()}`,
      );

      return false;
    }

    const { raydiumAmm } = stakingInfo;
    const isRaydiumAmmIsEqualToSystemProgramId = raydiumAmm.equals(SystemProgram.programId);
    const isPoolCreated = !isRaydiumAmmIsEqualToSystemProgramId;

    return isPoolCreated;
  }
}
