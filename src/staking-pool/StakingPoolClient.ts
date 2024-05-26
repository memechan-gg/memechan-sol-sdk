import { TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { AccountMeta, Keypair, PublicKey, Transaction, sendAndConfirmTransaction } from "@solana/web3.js";
import BigNumber from "bignumber.js";
import { MemechanClient } from "../MemechanClient";
import { BoundPoolClient } from "../bound-pool/BoundPoolClient";
import { MAX_MEME_TOKENS, MEMECHAN_QUOTE_MINT, MEME_TOKEN_DECIMALS } from "../config/config";
import { LivePoolClient } from "../live-pool/LivePoolClient";
import { MemeTicketClient } from "../memeticket/MemeTicketClient";
import { formatAmmKeysById } from "../raydium/formatAmmKeysById";
import { MemeTicketFields, StakingPoolFields } from "../schema/codegen/accounts";
import { getCreateAccountInstructions } from "../util/getCreateAccountInstruction";
import { getSendAndConfirmTransactionMethod } from "../util/getSendAndConfirmTransactionMethod";
import { retry } from "../util/retry";
import {
  AddFeesArgs,
  GetAddFeesTransactionArgs,
  GetAvailableUnstakeAmountArgs,
  GetUnstakeTransactionArgs,
  GetWithdrawFeesTransactionArgs,
  UnstakeArgs,
  WithdrawFeesArgs,
} from "./types";

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
  ) {}

  public static async fromStakingPoolId({
    client,
    poolAccountAddressId,
  }: {
    client: MemechanClient;
    poolAccountAddressId: PublicKey;
  }) {
    const stakingPoolObjectData = await client.memechanProgram.account.stakingPool.fetch(poolAccountAddressId);

    console.log("stakingPoolObjectData:", stakingPoolObjectData);

    const boundClientInstance = new StakingPoolClient(
      poolAccountAddressId,
      client,
      stakingPoolObjectData.pool,
      stakingPoolObjectData.memeVault,
      stakingPoolObjectData.memeMint,
      stakingPoolObjectData.lpVault,
      stakingPoolObjectData.lpMint,
      stakingPoolObjectData.quoteVault,
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

  public async getUnstakeTransaction(
    args: GetUnstakeTransactionArgs,
  ): Promise<{ transaction: Transaction; memeAccountKeypair: Keypair; quoteAccountKeypair: Keypair }> {
    const tx = args.transaction ?? new Transaction();
    const stakingInfo = await this.fetch();

    const memeAccountKeypair = Keypair.generate();
    const memeAccountPublicKey = memeAccountKeypair.publicKey;
    const createMemeAccountInstructions = await getCreateAccountInstructions(
      this.client.connection,
      args.user,
      stakingInfo.memeMint,
      args.user,
      memeAccountKeypair,
    );

    tx.add(...createMemeAccountInstructions);

    const quoteAccountKeypair = Keypair.generate();
    const quoteAccountPublicKey = quoteAccountKeypair.publicKey;
    const createQuoteAccountInstructions = await getCreateAccountInstructions(
      this.client.connection,
      args.user,
      MEMECHAN_QUOTE_MINT,
      args.user,
      quoteAccountKeypair,
    );

    tx.add(...createQuoteAccountInstructions);

    const unstakeInstruction = await this.client.memechanProgram.methods
      .unstake(args.amount)
      .accounts({
        memeTicket: args.ticket.id,
        signer: args.user,
        stakingSignerPda: this.findSignerPda(),
        memeVault: stakingInfo.memeVault,
        quoteVault: stakingInfo.quoteVault,
        staking: this.id,
        userMeme: memeAccountPublicKey,
        userQuote: quoteAccountPublicKey,
        tokenProgram: TOKEN_PROGRAM_ID,
      })
      .instruction();

    tx.add(unstakeInstruction);

    return { transaction: tx, memeAccountKeypair, quoteAccountKeypair };
  }

  public async unstake(
    args: UnstakeArgs,
  ): Promise<{ memeAccountPublicKey: PublicKey; quoteAccountPublicKey: PublicKey }> {
    const { memeAccountKeypair, transaction, quoteAccountKeypair } = await this.getUnstakeTransaction({
      ...args,
      user: args.user.publicKey,
    });

    const signature = await sendAndConfirmTransaction(
      this.client.connection,
      transaction,
      [args.user, memeAccountKeypair, quoteAccountKeypair],
      { commitment: "confirmed", skipPreflight: true },
    );
    console.log("unstake signature:", signature);

    return { memeAccountPublicKey: memeAccountKeypair.publicKey, quoteAccountPublicKey: quoteAccountKeypair.publicKey };
  }

  public async getAvailableUnstakeAmount({
    tickets,
    stakingPoolVestingConfig,
  }: GetAvailableUnstakeAmountArgs): Promise<string> {
    const { cliffTs, endTs, startTs } = stakingPoolVestingConfig;
    const currentTimeInMs = Date.now();
    const startTsInMs = new BigNumber(startTs.toString()).multipliedBy(1_000);
    const cliffTsInMs = new BigNumber(cliffTs.toString()).multipliedBy(1_000);
    const endTsInMs = new BigNumber(endTs.toString()).multipliedBy(1_000);
    console.log("currentTimeInMs:", currentTimeInMs.toString());
    console.log("startTsInMs:", startTsInMs.toString());
    console.log("cliffTsInMs:", cliffTsInMs.toString());
    console.log("endTsInMs:", endTsInMs.toString());

    // If linear unlock didn't start yet, return 0
    if (cliffTsInMs.gt(currentTimeInMs)) {
      return "0";
    }

    const stakedAmount = tickets.reduce((staked, { vesting: { notional, released } }) => {
      const notionalString = notional.toString();
      const releasedString = released.toString();
      const rest = new BigNumber(notionalString).minus(releasedString);

      return staked.plus(rest);
    }, new BigNumber(0));
    console.log("stakedAmount:", stakedAmount.toString());

    const unlockDurationInMs = endTsInMs.minus(cliffTsInMs);
    console.log("unlockDurationInMs:", unlockDurationInMs.toString());
    const unlockProgressInMs = new BigNumber(currentTimeInMs).minus(cliffTsInMs);
    console.log("unlockProgressInMs:", unlockProgressInMs.toString());
    const unlockProgressInAbsolutePercent = new BigNumber(unlockProgressInMs).div(unlockDurationInMs).toNumber();
    console.log("unlockProgressInAbsolutePercent:", unlockProgressInAbsolutePercent);

    // Extra safety net in case unlock progress is less than zero
    const unlockProgressWithLowerBound = Math.max(unlockProgressInAbsolutePercent, 0);
    console.log("unlockProgressWithLowerBound:", unlockProgressWithLowerBound);

    // Calculated unlock progress can be greater than 1, when it is already over
    const unlockProgressWithUpperBound = Math.min(unlockProgressWithLowerBound, 1);
    console.log("unlockProgressWithUpperBound:", unlockProgressWithUpperBound);

    // Unstake amount must be bignumerish, so `toFixed(0)`
    const availableUnstakeAmount = stakedAmount.multipliedBy(unlockProgressWithUpperBound).toFixed(0);
    console.log("availableUnstakeAmount:", availableUnstakeAmount.toString());

    return availableUnstakeAmount;
  }

  public async getWithdrawFeesTransaction(args: GetWithdrawFeesTransactionArgs): Promise<{
    transaction: Transaction;
    memeAccountKeypair: Keypair;
    quoteAccountKeypair: Keypair;
  }> {
    const tx = args.transaction ?? new Transaction();
    const stakingInfo = await this.fetch();

    const memeAccountKeypair = Keypair.generate();
    const memeAccountPublicKey = memeAccountKeypair.publicKey;
    const createMemeAccountInstructions = await getCreateAccountInstructions(
      this.client.connection,
      args.user,
      stakingInfo.memeMint,
      args.user,
      memeAccountKeypair,
    );

    tx.add(...createMemeAccountInstructions);

    const quoteAccountKeypair = Keypair.generate();
    const quoteAccountPublicKey = quoteAccountKeypair.publicKey;
    const createWSolAccountInstructions = await getCreateAccountInstructions(
      this.client.connection,
      args.user,
      MEMECHAN_QUOTE_MINT,
      args.user,
      quoteAccountKeypair,
    );

    tx.add(...createWSolAccountInstructions);

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

    return { transaction: tx, memeAccountKeypair, quoteAccountKeypair };
  }

  public async withdrawFees(
    args: WithdrawFeesArgs,
  ): Promise<{ memeAccountPublicKey: PublicKey; quoteAccountPublicKey: PublicKey }> {
    const { memeAccountKeypair, transaction, quoteAccountKeypair } = await this.getWithdrawFeesTransaction({
      ...args,
      user: args.user.publicKey,
    });

    const sendAndConfirmWithdrawFeesTransaction = getSendAndConfirmTransactionMethod({
      connection: this.client.connection,
      signers: [args.user, memeAccountKeypair, quoteAccountKeypair],
      transaction,
    });

    await retry({
      fn: sendAndConfirmWithdrawFeesTransaction,
      functionName: "withdrawFees",
    });

    return { memeAccountPublicKey: memeAccountKeypair.publicKey, quoteAccountPublicKey: quoteAccountKeypair.publicKey };
  }

  public async getAvailableWithdrawFeesAmount(
    args: WithdrawFeesArgs,
  ) /* : Promise<{ availableAmount: number; error?: TransactionError; logs?: string[] | null }>*/ {
    const { memeAccountKeypair, transaction, quoteAccountKeypair } = await this.getWithdrawFeesTransaction({
      ...args,
      user: args.user.publicKey,
    });

    const result = await this.client.connection.simulateTransaction(
      transaction,
      [args.user, memeAccountKeypair, quoteAccountKeypair],
      true,
    );

    if (result.value.err) {
      return { availableAmount: 0, error: result.value.err, logs: result.value.logs };
    }

    return result;
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

  /**
   * Fetches all unique token holders and memetickets owners for pool; then returns their number
   */
  public static async getHoldersCount(pool: PublicKey, mint: PublicKey, client: MemechanClient) {
    return (await StakingPoolClient.getHoldersList(pool, mint, client)).length;
  }

  /**
   * Fetches all unique token holders and memetickets owners for pool; then returns thier addresses
   */
  public static async getHoldersList(
    pool: PublicKey,
    mint: PublicKey,
    client: MemechanClient,
  ): Promise<
    [
      { address: string; tokenAmount: BigNumber; tokenAmountInPercentage: BigNumber }[],
      { address: string; amount: BigNumber },
    ]
  > {
    const stakingId = BoundPoolClient.findStakingPda(mint, client.memechanProgram.programId);
    const stakingPDA = StakingPoolClient.findSignerPda(stakingId, client.memechanProgram.programId).toBase58();

    const ticketHolderList = await BoundPoolClient.getHoldersMap(pool, client);
    const [tokenHolderList, stakingTokens] = await StakingPoolClient.getTokenHolderListHelius(
      mint,
      stakingPDA,
      client.heliusApiUrl,
    );

    const aggregatedHolderAmounts: Map<string, BigNumber> = new Map();
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const aggregatedStaking = new BigNumber(0);

    ticketHolderList.forEach((ticketFields: MemeTicketFields[], holder: string) => {
      let accumulator = new BigNumber(0);
      ticketFields.forEach((ticket) => {
        accumulator = accumulator.plus(ticket.amount.toString());
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
        tokenAmountInPercentage: amount.div(new BigNumber(MAX_MEME_TOKENS * MEME_TOKEN_DECIMALS)),
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
    return program.account.stakingPool.fetch(this.id);
  }

  public static async all(
    client: MemechanClient,
  ): Promise<{ account: StakingPoolFields; publicKey: PublicKey; livePool: LivePoolClient | null }[]> {
    const rawPools = await client.memechanProgram.account.stakingPool.all();
    const pools = await Promise.all(
      rawPools.map(async (el) => {
        let livePool: LivePoolClient | null = null;
        try {
          livePool = await LivePoolClient.fromAmmId(el.account.raydiumAmm, client);
        } catch (error) {
          console.error(`Failed to create livePool for account ${el.account}:`, error);
        }
        return {
          account: el.account,
          publicKey: el.publicKey,
          livePool,
        };
      }),
    );

    return pools;
  }

  public findSignerPda(): PublicKey {
    return StakingPoolClient.findSignerPda(this.id, this.client.memechanProgram.programId);
  }

  private getAccountMeta(pubkey: PublicKey): AccountMeta {
    return { isSigner: false, isWritable: true, pubkey };
  }
}
