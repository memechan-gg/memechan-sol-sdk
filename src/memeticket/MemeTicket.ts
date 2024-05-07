import { PublicKey } from "@solana/web3.js";
import { memechan } from "../../test/reference/helpers";
import { BondingMerge, CloseArgs, StakingMerge } from "./types";

export class MemeTicket {
  public constructor(public id: PublicKey) {
    //
  }

  public async fetch() {
    return memechan.account.memeTicket.fetch(this.id);
  }

  public async bound_merge(input: BondingMerge): Promise<MemeTicket> {
    const user = input.user;

    await memechan.methods
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

  public async staking_merge(input: StakingMerge): Promise<MemeTicket> {
    const user = input.user;

    await memechan.methods
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

    await memechan.methods
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
