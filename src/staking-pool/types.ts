import { BN } from "@coral-xyz/anchor";
import { Keypair, PublicKey, Transaction } from "@solana/web3.js";
import { MemeTicketClient } from "../memeticket/MemeTicketClient";
import { MemeTicketFields } from "../schema/codegen/accounts";
import { MemeTicketFields as MemeTicketFieldsV2 } from "../schema/v2/codegen/accounts";
import { VestingConfig } from "../schema/codegen/types";
import { MemeTicketClientV2 } from "../memeticket/MemeTicketClientV2";

export interface UnstakeArgs {
  ticket: MemeTicketClient;
  amount: BN;
  user: Keypair;
}

export interface UnstakeArgsV2 {
  ticket: MemeTicketClientV2;
  amount: BN;
  user: Keypair;
}

export type GetAvailableUnstakeAmountArgs = {
  tickets: MemeTicketFields[];
  stakingPoolVestingConfig: VestingConfig;
};

export type GetUnstakeTransactionArgs = Omit<UnstakeArgs, "user"> & {
  transaction?: Transaction;
  user: PublicKey;
};

export type GetUnstakeTransactionArgsV2 = Omit<UnstakeArgsV2, "user"> & {
  transaction?: Transaction;
  user: PublicKey;
};

export type GetPreparedUnstakeTransactionsArgs = {
  ticketIds: PublicKey[];
  ammPoolId: PublicKey;
  amount: BN;
  user: PublicKey;
  transaction?: Transaction;
};

export interface AddFeesArgs {
  ammPoolId: PublicKey;
  payer: Keypair;
}

export type GetAddFeesTransactionArgs = Omit<AddFeesArgs, "payer"> & {
  transaction?: Transaction;
  payer: PublicKey;
};

export interface WithdrawFeesArgs {
  ticket: MemeTicketClient;
  user: Keypair;
}

export type getAvailableWithdrawFeesAmountArgs = {
  tickets: MemeTicketFields[];
};

export interface WithdrawFeesArgsV2 {
  ticket: MemeTicketClientV2;
  user: Keypair;
}

export type getAvailableWithdrawFeesAmountArgsV2 = {
  tickets: MemeTicketFieldsV2[];
};

export type GetWithdrawFeesTransactionArgs = Omit<WithdrawFeesArgs, "user"> & {
  transaction?: Transaction;
  user: PublicKey;
};

export type GetWithdrawFeesTransactionArgsV2 = Omit<WithdrawFeesArgsV2, "user"> & {
  transaction?: Transaction;
  user: PublicKey;
};

export type GetPreparedWithdrawFeesTransactionsArgs = {
  ticketIds: PublicKey[];
  ammPoolId: PublicKey;
  user: PublicKey;
  transaction?: Transaction;
};

export interface AccountMeta {
  isSigner: boolean;
  isWritable: boolean;
  pubkey: PublicKey;
}

export type PrepareTransactionWithStakingTicketsMergeArgs = {
  transaction: Transaction;
  user: PublicKey;
  ticketIds: PublicKey[];
};
