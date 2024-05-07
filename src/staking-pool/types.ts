import { BN } from "@coral-xyz/anchor";
import { MemeTicket } from "../memeticket/MemeTicket";
import { Keypair, PublicKey } from "@solana/web3.js";

export interface UnstakeArgs {
  ticket: MemeTicket;
  amount: BN;
  user: Keypair;
}

export interface WithdrawFeesArgs {
  ticket: MemeTicket;
  user: Keypair;
}

export interface AccountMeta {
  isSigner: boolean;
  isWritable: boolean;
  pubkey: PublicKey;
}
