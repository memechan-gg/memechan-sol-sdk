import { Program } from "@coral-xyz/anchor";
import { TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { AccountMeta, Keypair, PublicKey, Transaction, sendAndConfirmTransaction } from "@solana/web3.js";
import BigNumber from "bignumber.js";
import { MemechanClient } from "../MemechanClient";
import { BoundPoolClient } from "../bound-pool/BoundPool";
import { MEMECHAN_QUOTE_MINT } from "../config/config";
import { MemeTicket } from "../memeticket/MemeTicket";
import { formatAmmKeysById } from "../raydium/formatAmmKeysById";
import { MemeTicketFields } from "../schema/codegen/accounts";
import { MemechanSol } from "../schema/types/memechan_sol";
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

export class StakingPool {
  constructor(
    public id: PublicKey,
    private client: MemechanClient,
    public pool: PublicKey,
    public memeVault: PublicKey,
    public memeMint: PublicKey,
    public lpVault: PublicKey,
    public lpMint: PublicKey,
    public quote_vault: PublicKey,
  ) {}

  public static async fromStakingPoolId({
    client,
    poolAccountAddressId,
  }: {
    client: MemechanClient;
    poolAccountAddressId: PublicKey;
  }) {
    const stakingPoolObjectData = await client.memechanProgram.account.stakingPool.fetch(poolAccountAddressId);

    // console.log("stakingPoolObjectData:", stakingPoolObjectData);

    const boundClientInstance = new StakingPool(
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

  public async getAddFeesTransaction({ transaction, ammPoolId, payer }: GetAddFeesTransactionArgs): Promise<Transaction> {
    const tx = transaction ?? new Transaction();
    const stakingInfo = await this.fetch();

    const ammPool = await formatAmmKeysById(ammPoolId.toBase58(), this.client.connection);

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
        signer: payer.publicKey,
        targetOrders: ammPool.targetOrders,
        stakingLpWallet: this.lpVault,
        raydiumProgram: ammPool.programId,
      })
      .instruction();

    tx.add(addFeesInstruction);

    return tx;
  }

  public async addFees({ payer, transaction, ammPoolId }: AddFeesArgs): Promise<void> {
    const addFeesTransaction = await this.getAddFeesTransaction({ transaction, ammPoolId, payer });

    const sendAndConfirmAddFeesTransaction = getSendAndConfirmTransactionMethod({
      connection: this.client.connection,
      signers: [payer],
      transaction: addFeesTransaction,
    });

    await retry({
      fn: sendAndConfirmAddFeesTransaction,
      functionName: "addFees",
      retries: 1
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
      args.user.publicKey,
      stakingInfo.memeMint,
      args.user.publicKey,
      memeAccountKeypair,
    );

    tx.add(...createMemeAccountInstructions);

    const quoteAccountKeypair = Keypair.generate();
    const quoteAccountPublicKey = quoteAccountKeypair.publicKey;
    const createQuoteAccountInstructions = await getCreateAccountInstructions(
      this.client.connection,
      args.user.publicKey,
      MEMECHAN_QUOTE_MINT,
      args.user.publicKey,
      quoteAccountKeypair,
    );

    tx.add(...createQuoteAccountInstructions);

    const unstakeInstruction = await this.client.memechanProgram.methods
      .unstake(args.amount)
      .accounts({
        memeTicket: args.ticket.id,
        signer: args.user.publicKey,
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
    const { memeAccountKeypair, transaction, quoteAccountKeypair } = await this.getUnstakeTransaction(args);

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
      args.user.publicKey,
      stakingInfo.memeMint,
      args.user.publicKey,
      memeAccountKeypair,
    );

    tx.add(...createMemeAccountInstructions);

    const quoteAccountKeypair = Keypair.generate();
    const quoteAccountPublicKey = quoteAccountKeypair.publicKey;
    const createWSolAccountInstructions = await getCreateAccountInstructions(
      this.client.connection,
      args.user.publicKey,
      MEMECHAN_QUOTE_MINT,
      args.user.publicKey,
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
        signer: args.user.publicKey,
        tokenProgram: TOKEN_PROGRAM_ID,
      })
      .instruction();

    tx.add(withdrawFeesInstruction);

    return { transaction: tx, memeAccountKeypair, quoteAccountKeypair };
  }

  public async withdrawFees(
    args: WithdrawFeesArgs,
  ): Promise<{ memeAccountPublicKey: PublicKey; quoteAccountPublicKey: PublicKey }> {
    const { memeAccountKeypair, transaction, quoteAccountKeypair } = await this.getWithdrawFeesTransaction(args);

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
  ) /*: Promise<{ availableAmount: number; error?: TransactionError; logs?: string[] | null }>*/ {
    const { memeAccountKeypair, transaction, quoteAccountKeypair } = await this.getWithdrawFeesTransaction(args);

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
    return StakingPool.getHoldersCount(this.pool, this.memeMint, this.client);
  }

  public async getHoldersList() {
    return StakingPool.getHoldersList(this.pool, this.memeMint, this.client);
  }

  /**
   * Fetches all tickets for corresponding pool id
   */
  public async fetchRelatedTickets(pool = this.pool, client = this.client): Promise<MemeTicketFields[]> {
    return MemeTicket.fetchRelatedTickets(pool, client);
  }

  /**
   * Fetches all unique token holders and memetickets owners for pool; then returns their number
   */
  public static async getHoldersCount(pool: PublicKey, mint: PublicKey, client: MemechanClient) {
    return (await StakingPool.getHoldersList(pool, mint, client)).length;
  }

  /**
   * Fetches all unique token holders and memetickets owners for pool; then returns thier addresses
   */
  public static async getHoldersList(pool: PublicKey, mint: PublicKey, client: MemechanClient) {
    const ticketHolderList = await BoundPoolClient.getHoldersList(pool, client);
    const tokenHolderList = await StakingPool.getTokenHolderListHelius(mint, client.heliusApiUrl);

    ticketHolderList.forEach((holder) => {
      tokenHolderList.add(holder);
    });

    return Array.from(tokenHolderList);
  }

  public static async getTokenHolderListHelius(mint: PublicKey, url: string) {
    let page = 1;
    const allOwners: Set<string> = new Set();

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

      data.result.token_accounts.forEach((account: { owner: string }) => allOwners.add(account.owner));
      page++;
    }

    return allOwners;
  }

  private async fetch(program = this.client.memechanProgram) {
    return program.account.stakingPool.fetch(this.id);
  }

  public static async all(program: Program<MemechanSol>) {
    return program.account.stakingPool.all();
  }

  public findSignerPda(): PublicKey {
    return StakingPool.findSignerPda(this.id, this.client.memechanProgram.programId);
  }

  private getAccountMeta(pubkey: PublicKey): AccountMeta {
    return { isSigner: false, isWritable: true, pubkey };
  }
}
