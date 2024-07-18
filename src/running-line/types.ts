export interface RunningLineEventData {
  type: "buy" | "sell" | "claim" | "unstake";
  tokenAddress: string;
  tokenTicker: string;
  tokenImage: string;
  amount: number;
  amountInUsd: number;
  sender: string;
}
