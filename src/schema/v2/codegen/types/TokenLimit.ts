import { PublicKey } from "@solana/web3.js"; // eslint-disable-line @typescript-eslint/no-unused-vars
import BN from "bn.js"; // eslint-disable-line @typescript-eslint/no-unused-vars
import * as types from "../types"; // eslint-disable-line @typescript-eslint/no-unused-vars
import * as borsh from "@project-serum/borsh";

export interface TokenLimitFields {
  mint: PublicKey;
  tokens: types.TokenAmountFields;
}

export interface TokenLimitJSON {
  mint: string;
  tokens: types.TokenAmountJSON;
}

export class TokenLimit {
  readonly mint: PublicKey;
  readonly tokens: types.TokenAmount;

  constructor(fields: TokenLimitFields) {
    this.mint = fields.mint;
    this.tokens = new types.TokenAmount({ ...fields.tokens });
  }

  static layout(property?: string) {
    return borsh.struct([borsh.publicKey("mint"), types.TokenAmount.layout("tokens")], property);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  static fromDecoded(obj: any) {
    return new TokenLimit({
      mint: obj.mint,
      tokens: types.TokenAmount.fromDecoded(obj.tokens),
    });
  }

  static toEncodable(fields: TokenLimitFields) {
    return {
      mint: fields.mint,
      tokens: types.TokenAmount.toEncodable(fields.tokens),
    };
  }

  toJSON(): TokenLimitJSON {
    return {
      mint: this.mint.toString(),
      tokens: this.tokens.toJSON(),
    };
  }

  static fromJSON(obj: TokenLimitJSON): TokenLimit {
    return new TokenLimit({
      mint: new PublicKey(obj.mint),
      tokens: types.TokenAmount.fromJSON(obj.tokens),
    });
  }

  toEncodable() {
    return TokenLimit.toEncodable(this);
  }
}
