import { Keypair, PublicKey, Transaction } from "@solana/web3.js";
import { MemeTicketFields, MemeTicketJSON } from "../schema/codegen/accounts";

export type GetBoundMergeTransactionArgs = {
  pool: PublicKey;
  user: PublicKey;
  ticketsToMerge: { id: PublicKey }[];
  transaction?: Transaction;
};

export type BoundMerge = GetBoundMergeTransactionArgs & { signer: Keypair };

export type GetStakingMergeTransactionArgs = {
  staking: PublicKey;
  user: PublicKey;
  ticketsToMerge: { id: PublicKey }[];
  transaction?: Transaction;
};

export type StakingMerge = GetStakingMergeTransactionArgs & { signer: Keypair };

export type GetCloseTransactionArgs = { user: PublicKey; transaction?: Transaction };

export type CloseArgs = GetCloseTransactionArgs & { signer: Keypair };

export type ParsedMemeTicket = {
  id: PublicKey;
  fields: MemeTicketFields;
  jsonFields: MemeTicketJSON;
  amountWithDecimals: string;
};
