import { PublicKey } from "@solana/web3.js"; // eslint-disable-line @typescript-eslint/no-unused-vars
import BN from "bn.js"; // eslint-disable-line @typescript-eslint/no-unused-vars
import * as types from "../types"; // eslint-disable-line @typescript-eslint/no-unused-vars
import * as borsh from "@project-serum/borsh";

export interface FeesFields {
  feeMemePercent: BN;
  feeQuotePercent: BN;
}

export interface FeesJSON {
  feeMemePercent: string;
  feeQuotePercent: string;
}

export class Fees {
  readonly feeMemePercent: BN;
  readonly feeQuotePercent: BN;

  constructor(fields: FeesFields) {
    this.feeMemePercent = fields.feeMemePercent;
    this.feeQuotePercent = fields.feeQuotePercent;
  }

  static layout(property?: string) {
    return borsh.struct([borsh.u64("feeMemePercent"), borsh.u64("feeQuotePercent")], property);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  static fromDecoded(obj: any) {
    return new Fees({
      feeMemePercent: obj.feeMemePercent,
      feeQuotePercent: obj.feeQuotePercent,
    });
  }

  static toEncodable(fields: FeesFields) {
    return {
      feeMemePercent: fields.feeMemePercent,
      feeQuotePercent: fields.feeQuotePercent,
    };
  }

  toJSON(): FeesJSON {
    return {
      feeMemePercent: this.feeMemePercent.toString(),
      feeQuotePercent: this.feeQuotePercent.toString(),
    };
  }

  static fromJSON(obj: FeesJSON): Fees {
    return new Fees({
      feeMemePercent: new BN(obj.feeMemePercent),
      feeQuotePercent: new BN(obj.feeQuotePercent),
    });
  }

  toEncodable() {
    return Fees.toEncodable(this);
  }
}
