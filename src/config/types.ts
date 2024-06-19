import { PublicKey } from "@solana/web3.js";

export interface TokenConfig {
  mint: PublicKey;
  targetConfig: PublicKey;
  decimals: number;
  name: string;
}

export enum TokenSymbol {
  WSOL = "WSOL",
  SLERF = "SLERF",
}
