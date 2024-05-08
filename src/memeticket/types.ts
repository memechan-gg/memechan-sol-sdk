import { Keypair, PublicKey } from "@solana/web3.js";
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
