import { BN } from "@coral-xyz/anchor";
import { Keypair, PublicKey, Transaction } from "@solana/web3.js";
import { MemeTicketClient } from "../memeticket/MemeTicketClient";
import { MemeTicketFields } from "../schema/codegen/accounts";
import { VestingConfig } from "../schema/codegen/types";

export interface UnstakeArgs {
  ticket: MemeTicketClient;
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

export type GetWithdrawFeesTransactionArgs = Omit<WithdrawFeesArgs, "user"> & {
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
