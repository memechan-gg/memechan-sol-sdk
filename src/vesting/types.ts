import { Connection, PublicKey, Transaction } from "@solana/web3.js";
import { Vesting } from "./schema/codegen/accounts";
import BN from "bn.js";

export type GetVestingPdaArgs = { vestingNumber: number; user: PublicKey };
export type FetchVestingByUserArgs = { user: PublicKey; connection: Connection };
export type GetVestingClaimableAmountArgs = { vesting: Vesting };
export type GetClaimTransactionArgs = {
  amount: BN;
  transaction?: Transaction;
  vesting: Vesting;
  vestingId: PublicKey;
};
