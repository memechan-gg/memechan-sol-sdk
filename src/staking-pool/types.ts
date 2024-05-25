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

export type GetUnstakeTransactionArgs = Omit<UnstakeArgs, "user"> & 
{
   transaction?: Transaction;
   user: PublicKey
};

export type AddFeesArgs = GetAddFeesTransactionArgs;

export type GetAddFeesTransactionArgs = { transaction?: Transaction; ammPoolId: PublicKey; payer: Keypair };

export interface WithdrawFeesArgs {
  ticket: MemeTicketClient;
  user: Keypair;
}

export type GetWithdrawFeesTransactionArgs = Omit<WithdrawFeesArgs, "user"> & 
{ 
  transaction?: Transaction;
  user: PublicKey;
};

export interface AccountMeta {
  isSigner: boolean;
  isWritable: boolean;
  pubkey: PublicKey;
}
