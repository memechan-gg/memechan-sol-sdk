import { Program } from "@coral-xyz/anchor";
import { NATIVE_MINT, TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { AccountMeta, GetProgramAccountsFilter, Keypair, PublicKey, Transaction } from "@solana/web3.js";
import { MemechanClient } from "../MemechanClient";
import { MemechanSol } from "../schema/types/memechan_sol";
import { getCreateAccountInstructions } from "../utils/getCreateAccountInstruction";
import { getSendAndConfirmTransactionMethod } from "../utils/getSendAndConfirmTransactionMethod";
import { retry } from "../utils/retry";
import {
  AddFeesArgs,
  GetAddFeesTransactionArgs,
  GetUnstakeTransactionArgs,
  GetWithdrawFeesTransactionArgs,
  UnstakeArgs,
  WithdrawFeesArgs,
} from "./types";
import { MemeTicketFields } from "../schema/codegen/accounts";
import { BoundPoolClient } from "../bound-pool/BoundPool";

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
  ) { }


  public static async fromStakingPoolId({
    client,
    poolAccountAddressId,
  }: {
    client: MemechanClient;
    poolAccountAddressId: PublicKey;
  }) {
    const stakingPoolObjectData = await client.memechanProgram.account.stakingPool.fetch(poolAccountAddressId);

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

  public async getAddFeesTransaction({ transaction }: GetAddFeesTransactionArgs): Promise<Transaction> {
    const tx = transaction ?? new Transaction();
    const stakingInfo = await this.fetch();

    const addFeesInstruction = await this.client.memechanProgram.methods
      .addFees()
      .accounts({
        memeVault: stakingInfo.memeVault,
        quoteVault: stakingInfo.quoteVault,
        staking: this.id,
        stakingSignerPda: this.findSignerPda(),
        tokenProgram: TOKEN_PROGRAM_ID,
      })
      .instruction();

    tx.add(addFeesInstruction);

    return tx;
  }

  public async addFees({ payer, transaction }: AddFeesArgs): Promise<void> {
    const addFeesTransaction = await this.getAddFeesTransaction({ transaction });

    const sendAndConfirmAddFeesTransaction = getSendAndConfirmTransactionMethod({
      connection: this.client.connection,
      signers: [payer],
      transaction: addFeesTransaction,
    });

    await retry({
      fn: sendAndConfirmAddFeesTransaction,
      functionName: "addFees",
    });
  }

  public async getUnstakeTransaction(
    args: GetUnstakeTransactionArgs,
  ): Promise<{ transaction: Transaction; memeAccountPublicKey: PublicKey; wSolAccountPublicKey: PublicKey }> {
    const tx = args.transaction ?? new Transaction();
    const stakingInfo = await this.fetch();

    const memeAccountKeypair = Keypair.generate();
    const memeAccountPublicKey = memeAccountKeypair.publicKey;
    const createMemeAccountInstructions = await getCreateAccountInstructions(
      this.client.connection,
      args.user,
      stakingInfo.memeMint,
      args.user.publicKey,
      memeAccountKeypair,
    );

    tx.add(...createMemeAccountInstructions);

    const wSolAccountKeypair = Keypair.generate();
    const wSolAccountPublicKey = wSolAccountKeypair.publicKey;
    const createWSolAccountInstructions = await getCreateAccountInstructions(
      this.client.connection,
      args.user,
      NATIVE_MINT,
      args.user.publicKey,
      wSolAccountKeypair,
    );

    tx.add(...createWSolAccountInstructions);

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
        userQuote: wSolAccountPublicKey,
        tokenProgram: TOKEN_PROGRAM_ID,
      })
      .instruction();

    tx.add(unstakeInstruction);

    return { transaction: tx, memeAccountPublicKey, wSolAccountPublicKey };
  }

  public async unstake(
    args: UnstakeArgs,
  ): Promise<{ memeAccountPublicKey: PublicKey; wSolAccountPublicKey: PublicKey }> {
    const { memeAccountPublicKey, transaction, wSolAccountPublicKey } = await this.getUnstakeTransaction(args);

    const sendAndConfirmUnstakeTransaction = getSendAndConfirmTransactionMethod({
      connection: this.client.connection,
      signers: [args.user],
      transaction,
    });

    await retry({
      fn: sendAndConfirmUnstakeTransaction,
      functionName: "unstake",
    });

    return { memeAccountPublicKey, wSolAccountPublicKey };
  }

  public async getWithdrawFeesTransaction(args: GetWithdrawFeesTransactionArgs): Promise<{
    transaction: Transaction;
    memeAccountPublicKey: PublicKey;
    wSolAccountPublicKey: PublicKey;
  }> {
    const tx = args.transaction ?? new Transaction();
    const stakingInfo = await this.fetch();

    const memeAccountKeypair = Keypair.generate();
    const memeAccountPublicKey = memeAccountKeypair.publicKey;
    const createMemeAccountInstructions = await getCreateAccountInstructions(
      this.client.connection,
      args.user,
      stakingInfo.memeMint,
      args.user.publicKey,
      memeAccountKeypair,
    );

    tx.add(...createMemeAccountInstructions);

    const wSolAccountKeypair = Keypair.generate();
    const wSolAccountPublicKey = wSolAccountKeypair.publicKey;
    const createWSolAccountInstructions = await getCreateAccountInstructions(
      this.client.connection,
      args.user,
      NATIVE_MINT,
      args.user.publicKey,
      wSolAccountKeypair,
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
        userQuote: wSolAccountPublicKey,
        signer: args.user.publicKey,
        tokenProgram: TOKEN_PROGRAM_ID,
      })
      .instruction();

    tx.add(withdrawFeesInstruction);

    return { transaction: tx, memeAccountPublicKey, wSolAccountPublicKey };
  }

  public async withdrawFees(
    args: WithdrawFeesArgs,
  ): Promise<{ memeAccountPublicKey: PublicKey; wSolAccountPublicKey: PublicKey }> {
    const { memeAccountPublicKey, transaction, wSolAccountPublicKey } = await this.getWithdrawFeesTransaction(args);

    const sendAndConfirmWithdrawFeesTransaction = getSendAndConfirmTransactionMethod({
      connection: this.client.connection,
      signers: [args.user],
      transaction,
    });

    await retry({
      fn: sendAndConfirmWithdrawFeesTransaction,
      functionName: "withdrawFees",
    });

    return { memeAccountPublicKey, wSolAccountPublicKey };
  }

  public async getHoldersCount() {
    return StakingPool.getHoldersCount(this.pool, this.memeMint, this.client)
  }

  public async getHoldersList() {
    return StakingPool.getHoldersList(this.pool, this.memeMint, this.client)
  }

  /**
   * Fetches all tickets for corresponding pool id
   */
  public async fetchRelatedTickets(pool = this.pool, client = this.client): Promise<MemeTicketFields[]> {
    return BoundPoolClient.fetchRelatedTickets(pool, client)
  }

  /**
   * Fetches all unique token holders and memetickets owners for pool; then returns their number
   */
  public static async getHoldersCount(pool: PublicKey, mint: PublicKey, client: MemechanClient) {
    return (await StakingPool.getHoldersList(pool, mint, client)).length
  }

  /**
   * Fetches all unique token holders and memetickets owners for pool; then returns thier addresses
   */
  public static async getHoldersList(pool: PublicKey, mint: PublicKey, client: MemechanClient) {
    const ticketHolderList = await BoundPoolClient.getHoldersList(pool, client);
    const tokenHolderList = await StakingPool.getTokenHolderListHel(mint);

    ticketHolderList.forEach(holder => {
      tokenHolderList.add(holder)
    });

    return Array.from(tokenHolderList)
  }

  public static async getTokenHolderListHel(mint: PublicKey) {
    let page = 1;
    let allOwners: Set<string> = new Set();

    const url = `https://devnet.helius-rpc.com/?api-key=${process.env.HELIUS_DEV_KEY}`;

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

      data.result.token_accounts.forEach((account: { owner: string; }) =>
        allOwners.add(account.owner)
      );
      page++;
    }

    return allOwners
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
