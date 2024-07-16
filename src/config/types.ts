import { Token } from "@raydium-io/raydium-sdk";
import { PublicKey } from "@solana/web3.js"; // Ensure correct import path based on your project setup
import { TokenInfo as SplTokenInfo } from "@solana/spl-token-registry";
import { TargetConfigClient } from "../targetconfig/TargetConfigClient";
import { TargetConfigClientV2 } from "../targetconfig/TargetConfigClientV2";

export interface TokenInfoArgs {
  programId: PublicKey;
  mint: PublicKey;
  decimals: number;
  symbol: string;
  name: string;
  displayName?: string;
  memeChanProgramId: PublicKey;
  memeChanProgramIdV2: PublicKey;
}

export class TokenInfo extends Token {
  public readonly targetConfig: PublicKey;
  public readonly targetConfigV2: PublicKey; // For v2 program
  public readonly displayName: string;

  constructor({
    programId,
    mint,
    decimals,
    symbol,
    name,
    memeChanProgramId,
    memeChanProgramIdV2,
    displayName = name,
  }: TokenInfoArgs) {
    super(programId, mint, decimals, symbol, name);

    (this.targetConfig = TargetConfigClient.findTargetConfigPda(mint, memeChanProgramId)),
      (this.targetConfigV2 = TargetConfigClientV2.findTargetConfigPda(mint, memeChanProgramIdV2)),
      (this.displayName = displayName);
  }

  public toSplTokenInfo(): SplTokenInfo {
    return {
      chainId: 900,
      address: this.mint.toBase58(),
      decimals: this.decimals,
      name: this.name || "",
      symbol: this.symbol || "",
      logoURI: "",
    };
  }
}

export enum TokenSymbol {
  WSOL = "WSOL",
  SLERF = "SLERF",
  CHAN = "CHAN",
}
