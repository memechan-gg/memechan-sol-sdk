import { Token } from "@raydium-io/raydium-sdk";
import { PublicKey } from "@solana/web3.js";

export class TokenInfo extends Token {
  public readonly targetConfig: PublicKey;

  constructor(
    programId: PublicKey,
    mint: PublicKey,
    decimals: number,
    symbol: string,
    name: string,
    targetConfig: PublicKey,
  ) {
    super(programId, mint, decimals, symbol, name);
    this.targetConfig = targetConfig;
  }
}

export enum TokenSymbol {
  WSOL = "WSOL",
  SLERF = "SLERF",
}
