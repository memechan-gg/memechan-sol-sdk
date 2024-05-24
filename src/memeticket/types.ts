import { Keypair, PublicKey, Transaction } from "@solana/web3.js";
import { MemeTicketFields, MemeTicketJSON } from "../schema/codegen/accounts";
import { MemeTicketClient } from "./MemeTicketClient";

export interface BoundMerge {
  pool: PublicKey;
  user: Keypair;
  ticketsToMerge: MemeTicketClient[];
}

export type GetBoundMergeTransactionArgs = BoundMerge & { transaction?: Transaction };

export interface StakingMerge {
  staking: PublicKey;
  user: Keypair;
  ticketsToMerge: MemeTicketClient[];
}

export type GetStakingMergeTransactionArgs = StakingMerge & { transaction?: Transaction };

export interface CloseArgs {
  user: Keypair;
}

export type GetCloseTransactionArgs = CloseArgs & { transaction?: Transaction };

export type ParsedMemeTicket = { id: PublicKey; fields: MemeTicketFields; jsonFields: MemeTicketJSON };
