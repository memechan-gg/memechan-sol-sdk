import { BN } from "@coral-xyz/anchor";
import { Keypair, PublicKey, Transaction } from "@solana/web3.js";
import { MemeTicket } from "../memeticket/MemeTicket";
import { MemeTicketFields } from "../schema/codegen/accounts";
import { VestingConfig } from "../schema/codegen/types";

export interface UnstakeArgs {
  ticket: MemeTicket;
  amount: BN;
  user: Keypair;
}

export type GetAvailableUnstakeAmountArgs = {
  tickets: MemeTicketFields[];
  stakingPoolVestingConfig: VestingConfig;
};

export type GetUnstakeTransactionArgs = UnstakeArgs & { transaction?: Transaction };

export type AddFeesArgs = GetAddFeesTransactionArgs;

export type GetAddFeesTransactionArgs = { transaction?: Transaction; ammPoolId: PublicKey; payer: Keypair };

export interface WithdrawFeesArgs {
  ticket: MemeTicket;
  user: Keypair;
}

export type GetWithdrawFeesTransactionArgs = WithdrawFeesArgs & { transaction?: Transaction };

export interface AccountMeta {
  isSigner: boolean;
  isWritable: boolean;
  pubkey: PublicKey;
}
