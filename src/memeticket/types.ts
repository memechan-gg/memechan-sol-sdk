import { Keypair, PublicKey } from "@solana/web3.js";
import { MemeTicketFields } from "../schema/codegen/accounts";
import { MemeTicket } from "./MemeTicket";

export interface BoundMerge {
  pool: PublicKey;
  user: Keypair;
  ticketToMerge: MemeTicket;
}

export interface StakingMerge {
  staking: PublicKey;
  user: Keypair;
  ticketToMerge: MemeTicket;
}

export interface CloseArgs {
  user: Keypair;
}

export type StringifiedMemeTicketFields = Omit<MemeTicketFields, "amount" | "untilTimestamp"> & {
  amount: string;
  untilTimestamp: string;
};
