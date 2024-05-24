import { BN } from "@coral-xyz/anchor";
import { MemeTicketClient } from "../memeticket/MemeTicketClient";
import { Keypair, PublicKey, Transaction } from "@solana/web3.js";

export interface UnstakeArgs {
  ticket: MemeTicketClient;
  amount: BN;
  user: Keypair;
}

export type GetUnstakeTransactionArgs = UnstakeArgs & { transaction?: Transaction };

export type AddFeesArgs = GetAddFeesTransactionArgs;

export type GetAddFeesTransactionArgs = { transaction?: Transaction; ammPoolId: PublicKey; payer: Keypair };

export interface WithdrawFeesArgs {
  ticket: MemeTicketClient;
  user: Keypair;
}

export type GetWithdrawFeesTransactionArgs = WithdrawFeesArgs & { transaction?: Transaction };

export interface AccountMeta {
  isSigner: boolean;
  isWritable: boolean;
  pubkey: PublicKey;
}
