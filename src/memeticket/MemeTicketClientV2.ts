import { Program } from "@coral-xyz/anchor";
import {
  AccountInfo,
  Connection,
  GetProgramAccountsFilter,
  PublicKey,
  Transaction,
  sendAndConfirmTransaction,
} from "@solana/web3.js";
import BigNumber from "bignumber.js";
import { MemechanClientV2 } from "../MemechanClientV2";
import { MEMECHAN_MEME_TOKEN_DECIMALS, MEMECHAN_PROGRAM_ID_V2 } from "../config/config";
import { MemeTicket, MemeTicketFields } from "../schema/v2/codegen/accounts";
import { MemechanSol } from "../schema/v2/types/memechan_sol";
import {
  BoundMerge,
  CloseArgs,
  GetBoundMergeTransactionArgs,
  GetCloseTransactionArgs,
  GetStakingMergeTransactionArgs,
  ParsedMemeTicketV2,
  StakingMerge,
} from "./types";
import { getOptimizedTransactions } from "./utils";

export class MemeTicketClientV2 {
  public constructor(
    public id: PublicKey,
    public client: MemechanClientV2,
  ) {
    //
  }

  // let's use numbering from 1 always
  public static TICKET_NUMBER_START = 1;

  public async fetch(program = this.client.memechanProgram) {
    return await program.account.memeTicket.fetch(this.id, "confirmed");
  }

  public static async all(program: Program<MemechanSol>) {
    return await program.account.memeTicket.all();
  }

  public static getFirstHunderTicketsPubkeys({ userId, poolId }: { userId: PublicKey; poolId: PublicKey }) {
    const ticketsList = new Array(100).fill(undefined).map((el, i) =>
      MemeTicketClientV2.getMemeTicketPDA({
        userId,
        poolId,
        ticketNumber: i + MemeTicketClientV2.TICKET_NUMBER_START,
      }),
    );

    return ticketsList;
  }

  public static getMemeTicketPDA({
    ticketNumber,
    poolId,
    userId,
  }: {
    ticketNumber: number;
    poolId: PublicKey;
    userId: PublicKey;
  }): PublicKey {
    // 8 bytes array
    const dv = new DataView(new ArrayBuffer(8), 0);
    // set u64 in little endian format
    dv.setBigUint64(0, BigInt(ticketNumber), true);

    // find pda
    const pda = PublicKey.findProgramAddressSync(
      [poolId.toBytes(), userId.toBytes(), new Uint8Array(dv.buffer)],
      new PublicKey(MEMECHAN_PROGRAM_ID_V2),
    )[0];

    return pda;
  }

  public async getBoundMergeTransaction({
    transaction,
    pool,
    ticketsToMerge,
    user,
  }: GetBoundMergeTransactionArgs): Promise<Transaction> {
    const tx = transaction ?? new Transaction();

    for (const ticket of ticketsToMerge) {
      const mergeInstruction = await this.client.memechanProgram.methods
        .boundMergeTickets()
        .accounts({
          owner: user,
          pool: pool,
          ticketFrom: ticket.id,
          ticketInto: this.id,
        })
        .instruction();

      tx.add(mergeInstruction);
    }

    return tx;
  }

  public async boundMerge(input: BoundMerge): Promise<MemeTicketClientV2> {
    const { transactions } = await this.getBoundMergeTransactions(input);

    for (const tx of transactions) {
      const signature = await sendAndConfirmTransaction(this.client.connection, tx, [input.signer], {
        commitment: "confirmed",
        skipPreflight: true,
        preflightCommitment: "confirmed",
      });
      console.log("bound merge signature:", signature);
    }

    return this;
  }

  public async getBoundMergeTransactions(input: GetBoundMergeTransactionArgs): Promise<{
    transactions: Transaction[];
    isMoreThanOneTransaction: boolean;
  }> {
    const mergeTransaction = await this.getBoundMergeTransaction(input);
    const optimizedTransactions = getOptimizedTransactions(mergeTransaction.instructions, input.user);

    return { transactions: optimizedTransactions, isMoreThanOneTransaction: optimizedTransactions.length > 0 };
  }

  public async getStakingMergeTransaction({
    staking,
    ticketsToMerge,
    user,
    transaction,
  }: GetStakingMergeTransactionArgs): Promise<Transaction> {
    const tx = transaction ?? new Transaction();

    for (const ticket of ticketsToMerge) {
      const mergeInstruction = await this.client.memechanProgram.methods
        .stakingMergeTickets()
        .accounts({
          owner: user,
          staking: staking,
          ticketFrom: ticket.id,
          ticketInto: this.id,
        })
        .instruction();

      tx.add(mergeInstruction);
    }

    return tx;
  }

  public async stakingMerge(input: StakingMerge): Promise<MemeTicketClientV2> {
    const mergeTransaction = await this.getStakingMergeTransaction(input);

    const optimizedTransactions = getOptimizedTransactions(mergeTransaction.instructions, input.user);

    for (const tx of optimizedTransactions) {
      const signature = await sendAndConfirmTransaction(this.client.connection, tx, [input.signer], {
        commitment: "confirmed",
        skipPreflight: true,
      });
      console.log("staking merge signature:", signature);
    }

    return this;
  }

  public async getCloseTransaction({ user, transaction }: GetCloseTransactionArgs): Promise<Transaction> {
    const tx = transaction ?? new Transaction();

    const closeInstruction = await this.client.memechanProgram.methods
      .closeTicket()
      .accounts({
        owner: user,
        ticket: this.id,
      })
      .instruction();

    tx.add(closeInstruction);

    return tx;
  }

  public async close(input: CloseArgs): Promise<MemeTicketClientV2> {
    const closeTransaction = await this.getCloseTransaction(input);

    const signature = await sendAndConfirmTransaction(this.client.connection, closeTransaction, [input.signer], {
      commitment: "confirmed",
      skipPreflight: true,
    });
    console.log("close meme ticket signature:", signature);

    return this;
  }

  /**
   * Fetches all tickets for provided pool id
   */
  public static async fetchRelatedTickets(pool: PublicKey, client: MemechanClientV2): Promise<MemeTicketFields[]> {
    const program = client.memechanProgram;
    const filters: GetProgramAccountsFilter[] = [
      {
        memcmp: {
          bytes: pool.toBase58(),
          offset: 40,
        },
      },
    ];

    const fetchedTickets = await program.account.memeTicket.all(filters);
    const tickets = fetchedTickets.map((ticket) => ticket.account);
    return tickets;
  }

  public static async fetchTicketsByUser2(
    pool: PublicKey,
    client: MemechanClientV2,
    user: PublicKey,
  ): Promise<ReturnType<typeof MemeTicketClientV2.fetchTicketsByIds>> {
    // TODO: Iterate until we'll not reach empty tickets
    const ticketsList = MemeTicketClientV2.getFirstHunderTicketsPubkeys({ userId: user, poolId: pool });
    const ticketsIdsList = ticketsList.map((ticket) => ticket.toString());
    const fetchedTickets = await MemeTicketClientV2.fetchTicketsByIds(ticketsIdsList, client.connection);

    return fetchedTickets;
  }

  public static async fetchAvailableTicketsByUser2(pool: PublicKey, client: MemechanClientV2, user: PublicKey) {
    const { tickets } = await MemeTicketClientV2.fetchTicketsByUser2(pool, client, user);
    const currentTimestamp = Date.now();

    const availableTickets = tickets.filter((ticket) => {
      const unlockTicketTimestamp = +ticket.jsonFields.untilTimestamp;

      return currentTimestamp >= unlockTicketTimestamp;
    });

    const availableAmount = availableTickets.reduce((amount: BigNumber, ticket) => {
      amount = amount.plus(ticket.jsonFields.amount);
      return amount;
    }, new BigNumber(0));

    const availableAmountWithDecimals = availableAmount.div(10 ** MEMECHAN_MEME_TOKEN_DECIMALS);

    return {
      tickets: availableTickets,
      availableAmount: availableAmount.toString(),
      availableAmountWithDecimals: availableAmountWithDecimals.toString(),
    };
  }

  public static async fetchTicketsByIds(ticketIds: string[], connection: Connection) {
    const ticketIdPubkeys = ticketIds.map((id) => new PublicKey(id));
    const accountInfos = await connection.getMultipleAccountsInfo(ticketIdPubkeys);

    const freeIndexes: number[] = [];
    const lockedIndexes: number[] = [];

    const foundAccountsData: { accountInfo: AccountInfo<Buffer>; index: number }[] = accountInfos.reduce(
      (dataArray: { accountInfo: AccountInfo<Buffer>; index: number }[], accountInfo, index) => {
        if (accountInfo !== null) {
          dataArray.push({ accountInfo, index });
          lockedIndexes.push(index);
        } else {
          freeIndexes.push(index);
        }

        return dataArray;
      },
      [],
    );

    const parsedTickets: ParsedMemeTicketV2[] = foundAccountsData.map(({ accountInfo, index }) => {
      const id = new PublicKey(ticketIds[index]);
      const decodedTicket = MemeTicket.decode(accountInfo.data);
      const jsonTicket = decodedTicket.toJSON();

      return {
        id,
        jsonFields: jsonTicket,
        fields: decodedTicket,
        amountWithDecimals: new BigNumber(jsonTicket.amount).dividedBy(10 ** MEMECHAN_MEME_TOKEN_DECIMALS).toString(),
      };
    });

    return { tickets: parsedTickets, freeIndexes, lockedIndexes };
  }

  /**
   * Retrieves the required tickets to sell to meet or exceed a specified amount.
   *
   * @param {Object} params - The parameters object.
   * @param {BigNumber} params.amount - The amount required to fulfill.
   * @param {ParsedMemeTicket[]} params.availableTickets - The list of available tickets.
   * @returns {Promise<{ticketsRequiredToSell: ParsedMemeTicket[]}>} The list of tickets required to sell.
   *
   * @throws {Error} If the available tickets list is empty.
   * @throws {Error} If the required amount cannot be met with the available tickets.
   * @throws {Error} If no tickets are required to sell.
   *
   * @note This method relies on the assumption that the total amount
   * of available tickets will always be greater than or equal to the specified amount.
   */
  public static async getRequiredTicketsToSell({
    amount,
    availableTickets,
  }: {
    amount: BigNumber;
    availableTickets: ParsedMemeTicketV2[];
  }): Promise<{ ticketsRequiredToSell: ParsedMemeTicketV2[]; isMoreThanOneTicket: boolean }> {
    // Check if the availableTickets array is empty
    if (availableTickets.length === 0) {
      throw new Error("[getRequiredTicketsToSell] No available tickets to sell.");
    }

    // Initialize an array to hold the required tickets
    const ticketsRequiredToSell: ParsedMemeTicketV2[] = [];

    // Initialize a BigNumber to keep track of the accumulated amount
    let accumulatedAmount = new BigNumber(0);

    // Iterate over the available tickets
    for (const ticket of availableTickets) {
      // Convert the ticket amount to BigNumber
      const ticketAmount = new BigNumber(ticket.jsonFields.amount);

      // Add the ticket to the list of required tickets
      ticketsRequiredToSell.push(ticket);

      // Accumulate the amount
      accumulatedAmount = accumulatedAmount.plus(ticketAmount);

      // Check if the accumulated amount meets or exceeds the required amount
      if (accumulatedAmount.isGreaterThanOrEqualTo(amount)) {
        break; // We have enough tickets, break out of the loop
      }
    }

    // If we exit the loop without fulfilling the amount, throw an error
    if (accumulatedAmount.isLessThan(amount)) {
      throw new Error(
        `[getRequiredTicketsToSell] Insufficient tickets to fulfill the required amount.
      Amount to fulfil: ${amount.toString()}, accumulatedAmount: ${accumulatedAmount}`,
      );
    }

    // If no tickets were added to ticketsRequiredToSell, throw an error
    if (ticketsRequiredToSell.length === 0) {
      throw new Error("[getRequiredTicketsToSell] No tickets required to sell.");
    }

    // Return the list of required tickets
    return { ticketsRequiredToSell, isMoreThanOneTicket: ticketsRequiredToSell.length > 1 };
  }
}
