import { PublicKey } from "@solana/web3.js";
import { BoundMerge, CloseArgs, StakingMerge } from "./types";
import { SolanaContext } from "../common/types";

export class MemeTicket {
  public constructor(public id: PublicKey, public solanaContext: SolanaContext) {
    //
  }

  public async fetch() {
    return this.solanaContext.memechanProgram.account.memeTicket.fetch(this.id);
  }

  public async boundMerge(input: BoundMerge): Promise<MemeTicket> {
    const user = input.user;

    await this.solanaContext.memechanProgram.methods
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

    await this.solanaContext.memechanProgram.methods
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

    await this.solanaContext.memechanProgram.methods
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
