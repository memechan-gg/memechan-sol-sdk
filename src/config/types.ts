import { PublicKey } from "@solana/web3.js";

export interface TokenConfig {
  mint: PublicKey;
  targetConfig: PublicKey;
  decimals: number;
  symbol: string;
  name: string;
}
