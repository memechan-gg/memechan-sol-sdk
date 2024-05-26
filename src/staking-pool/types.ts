import { BN } from "@coral-xyz/anchor";
import { MemeTicketClient } from "../memeticket/MemeTicketClient";
import { Keypair, PublicKey, Transaction } from "@solana/web3.js";
import { VestingConfig } from "../schema/codegen/types";
import { MemeTicketFields } from "../schema/codegen/accounts";

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

export type GetWithdrawFeesTransactionArgs = Omit<WithdrawFeesArgs, "user"> & {
  transaction?: Transaction;
  user: PublicKey;
};

export interface AccountMeta {
  isSigner: boolean;
  isWritable: boolean;
  pubkey: PublicKey;
}
