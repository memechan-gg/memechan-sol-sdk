import { PublicKey } from "@solana/web3.js"; // eslint-disable-line @typescript-eslint/no-unused-vars
import BN from "bn.js"; // eslint-disable-line @typescript-eslint/no-unused-vars
import * as types from "../types"; // eslint-disable-line @typescript-eslint/no-unused-vars
import * as borsh from "@project-serum/borsh";

export interface ReserveFields {
  tokens: BN;
  mint: PublicKey;
  vault: PublicKey;
}

export interface ReserveJSON {
  tokens: string;
  mint: string;
  vault: string;
}

export class Reserve {
  readonly tokens: BN;
  readonly mint: PublicKey;
  readonly vault: PublicKey;

  constructor(fields: ReserveFields) {
    this.tokens = fields.tokens;
    this.mint = fields.mint;
    this.vault = fields.vault;
  }

  static layout(property?: string) {
    return borsh.struct([borsh.u64("tokens"), borsh.publicKey("mint"), borsh.publicKey("vault")], property);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  static fromDecoded(obj: any) {
    return new Reserve({
      tokens: obj.tokens,
      mint: obj.mint,
      vault: obj.vault,
    });
  }

  static toEncodable(fields: ReserveFields) {
    return {
      tokens: fields.tokens,
      mint: fields.mint,
      vault: fields.vault,
    };
  }

  toJSON(): ReserveJSON {
    return {
      tokens: this.tokens.toString(),
      mint: this.mint.toString(),
      vault: this.vault.toString(),
    };
  }

  static fromJSON(obj: ReserveJSON): Reserve {
    return new Reserve({
      tokens: new BN(obj.tokens),
      mint: new PublicKey(obj.mint),
      vault: new PublicKey(obj.vault),
    });
  }

  toEncodable() {
    return Reserve.toEncodable(this);
  }
}
