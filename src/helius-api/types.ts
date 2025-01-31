import BigNumber from "bignumber.js";
import { TransactionDataByDigest } from "./typeguards/txTypeguard";

export type TokenAccountRaw = {
  account: string;
  amount: string;
};

export type TokenAccountWithBNAmount = {
  account: string;
  amount: BigNumber;
};

export type ParsedTxData = {
  signature: string;
  timestamp: number;
  amountBN: BigNumber;
  user: string;
};

export type AggregatedTxData = {
  totalBN: BigNumber;
  user: string;
  transferData: {
    signature: string;
    timestamp: number;
    amountBN: BigNumber;
    user: string;
  }[];
};

export type AggregatedTxDataWithBonus = AggregatedTxData & {
  bonus: boolean;
  totalIncludingBonusBN: BigNumber;
};

export type UserAllocationsData = AggregatedTxDataWithBonus & {
  tokenAllocationIncludingBonus: BigNumber;
  tokenAllocationExcludingBonus: BigNumber;
};

export type FilteredOutTxsDataByReason = {
  failedTxs: TransactionDataByDigest[];
  noNativeTransfer: TransactionDataByDigest[];
  notCorrespondingToTargetAddress: TransactionDataByDigest[];
  beforeFromTimestamp: TransactionDataByDigest[];
  afterToTimestamp: TransactionDataByDigest[];
  notAllowedAddresses: TransactionDataByDigest[];
};
