import { Connection, PublicKey, Transaction } from "@solana/web3.js";
import { Vesting } from "./schema/codegen/accounts";
import BN from "bn.js";
import { TokenAccountRaw } from "../helius-api/types";

export type GetVestingPdaArgs = { vestingNumber: number; user: PublicKey };
export type FetchVestingByUserArgs = { user: PublicKey; connection: Connection };
export type GetVestingClaimableAmountArgs = { vesting: Vesting };
export type GetClaimTransactionArgs = {
  amount: BN;
  transaction?: Transaction;
  vesting: Vesting;
  vestingId: PublicKey;
};
export type GetCreateVestingTransactionArgs = {
  beneficiary: PublicKey;
  admin: PublicKey;
  mint: PublicKey;
  startTs: number;
  endTs: number;
  amount: BN;
};
export type UserVestingData = { beneficiary: string; amount: string; amountUI: string; startTs: number; endTs: number };

export type PatsHolderMapWithIndex = { [patsHolderAddress: string]: TokenAccountRaw & { index: number } };
