import { PublicKey } from "@solana/web3.js"; // eslint-disable-line @typescript-eslint/no-unused-vars
import BN from "bn.js"; // eslint-disable-line @typescript-eslint/no-unused-vars
import * as types from "../types"; // eslint-disable-line @typescript-eslint/no-unused-vars
import * as borsh from "@project-serum/borsh";

export interface DecimalsFields {
  alpha: BN;
  beta: BN;
  quote: BN;
}

export interface DecimalsJSON {
  alpha: string;
  beta: string;
  quote: string;
}

export class Decimals {
  readonly alpha: BN;
  readonly beta: BN;
  readonly quote: BN;

  constructor(fields: DecimalsFields) {
    this.alpha = fields.alpha;
    this.beta = fields.beta;
    this.quote = fields.quote;
  }

  static layout(property?: string) {
    return borsh.struct([borsh.u128("alpha"), borsh.u128("beta"), borsh.u64("quote")], property);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  static fromDecoded(obj: any) {
    return new Decimals({
      alpha: obj.alpha,
      beta: obj.beta,
      quote: obj.quote,
    });
  }

  static toEncodable(fields: DecimalsFields) {
    return {
      alpha: fields.alpha,
      beta: fields.beta,
      quote: fields.quote,
    };
  }

  toJSON(): DecimalsJSON {
    return {
      alpha: this.alpha.toString(),
      beta: this.beta.toString(),
      quote: this.quote.toString(),
    };
  }

  static fromJSON(obj: DecimalsJSON): Decimals {
    return new Decimals({
      alpha: new BN(obj.alpha),
      beta: new BN(obj.beta),
      quote: new BN(obj.quote),
    });
  }

  toEncodable() {
    return Decimals.toEncodable(this);
  }
}
