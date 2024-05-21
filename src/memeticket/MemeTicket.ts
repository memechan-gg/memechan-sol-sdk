import { PublicKey } from "@solana/web3.js";
import { BoundMerge, CloseArgs, StakingMerge } from "./types";
import { MemechanClient } from "../MemechanClient";
import { MemechanSol } from "../schema/types/memechan_sol";
import { Program } from "@coral-xyz/anchor";

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
}
