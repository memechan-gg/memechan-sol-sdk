import { Program } from "@coral-xyz/anchor";
import { GetProgramAccountsFilter, PublicKey } from "@solana/web3.js";
import BigNumber from "bignumber.js";
import { MemechanClient } from "../MemechanClient";
import { MemeTicketFields } from "../schema/codegen/accounts";
import { MemechanSol } from "../schema/types/memechan_sol";
import { BoundMerge, CloseArgs, StakingMerge, StringifiedMemeTicketFields } from "./types";
import { MEMECHAN_MEME_TOKEN_DECIMALS } from "../config/config";

export class MemeTicket {
  public constructor(
    public id: PublicKey,
    public client: MemechanClient,
  ) {
    //
  }

  public async fetch(program = this.client.memechanProgram) {
    return program.account.memeTicket.fetch(this.id);
  }

  public static async all(program: Program<MemechanSol>) {
    return program.account.memeTicket.all();
  }

  // TODO:
  // Add method for fetching tickets by user

  public async boundMerge(input: BoundMerge): Promise<MemeTicket> {
    const user = input.user;

    await this.client.memechanProgram.methods
      .boundMergeTickets()
      .accounts({
        owner: user.publicKey,
        pool: input.pool,
        ticketFrom: input.ticketToMerge.id,
        ticketInto: this.id,
      })
      .signers([user])
      .rpc();

    return this;
  }

  public async stakingMerge(input: StakingMerge): Promise<MemeTicket> {
    const user = input.user;

    await this.client.memechanProgram.methods
      .stakingMergeTickets()
      .accounts({
        owner: user.publicKey,
        staking: input.staking,
        ticketFrom: input.ticketToMerge.id,
        ticketInto: this.id,
      })
      .signers([user])
      .rpc();

    return this;
  }

  public async close(input: CloseArgs): Promise<MemeTicket> {
    const user = input.user;

    await this.client.memechanProgram.methods
      .closeTicket()
      .accounts({
        owner: user.publicKey,
        ticket: this.id,
      })
      .signers([user])
      .rpc();

    return this;
  }

  /**
   * Fetches all tickets for provided pool id
   */
  public static async fetchRelatedTickets(pool: PublicKey, client: MemechanClient): Promise<MemeTicketFields[]> {
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

  public static async fetchTicketsByUser(
    pool: PublicKey,
    client: MemechanClient,
    user: PublicKey,
  ): Promise<StringifiedMemeTicketFields[]> {
    const program = client.memechanProgram;
    const filters: GetProgramAccountsFilter[] = [
      {
        memcmp: {
          bytes: pool.toBase58(),
          offset: 40,
        },
      },
      {
        memcmp: {
          bytes: user.toBase58(),
          offset: 8,
        },
      },
    ];

    const fetchedTickets = await program.account.memeTicket.all(filters);
    const tickets = fetchedTickets.map((ticket) => ticket.account);

    const stringifiedTickets = tickets.map((ticket) => {
      return {
        ...ticket,
        untilTimestamp: ticket.untilTimestamp.toString(),
        amount: ticket.amount.toString(),
        // Note: we relay that memecoin decimals and ticket coin decimals are always equal,
        // otherwise we'll need to fetch meta to get decimals for each ticket
        balanceWithDecimals: new BigNumber(ticket.amount.toString())
          .dividedBy(10 ** MEMECHAN_MEME_TOKEN_DECIMALS)
          .toString(),
      };
    });

    return stringifiedTickets;
  }

  public static async fetchAvailableTicketsByUser(pool: PublicKey, client: MemechanClient, user: PublicKey) {
    const tickets = await MemeTicket.fetchTicketsByUser(pool, client, user);
    const currentTimestamp = Date.now();

    const availableTickets = tickets.filter((ticket) => {
      const unlockTicketTimestamp = +ticket.untilTimestamp;

      return currentTimestamp >= unlockTicketTimestamp;
    });

    const availableAmount = availableTickets.reduce((amount: BigNumber, ticket) => {
      amount = amount.plus(ticket.amount);
      return amount;
    }, new BigNumber(0));

    const availableAmountWithDecimals = availableAmount.div(10 ** MEMECHAN_MEME_TOKEN_DECIMALS);

    return {
      tickets: availableTickets,
      amount: availableAmount.toString(),
      amountWithDecimals: availableAmountWithDecimals,
    };
  }
}
