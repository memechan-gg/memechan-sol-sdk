export interface BaseEventData {
  type: "buy" | "sell" | "claim" | "unstake";
  tokenAddress: string;
  tokenTicker: string;
  tokenImage: string;
  sender: string;
}

export interface BuySellEventData extends BaseEventData {
  type: "buy" | "sell";
  amount: number;
  amountInUsd: number;
}

export interface ClaimUnstakeEventData extends BaseEventData {
  type: "claim" | "unstake";
  memeAmount: number;
  memeAmountInUsd: number;
  quoteAmount: number;
  quoteAmountInUsd: number;
  chanAmount: number;
  chanAmountInUsd: number;
}

export type RunningLineEventData = BuySellEventData | ClaimUnstakeEventData;
