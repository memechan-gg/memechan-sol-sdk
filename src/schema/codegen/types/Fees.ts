import { PublicKey } from "@solana/web3.js" // eslint-disable-line @typescript-eslint/no-unused-vars
import BN from "bn.js" // eslint-disable-line @typescript-eslint/no-unused-vars
import * as types from "../types" // eslint-disable-line @typescript-eslint/no-unused-vars
import * as borsh from "@project-serum/borsh"

export interface FeesFields {
  feeInPercent: BN
  feeOutPercent: BN
}

export interface FeesJSON {
  feeInPercent: string
  feeOutPercent: string
}

export class Fees {
  readonly feeInPercent: BN
  readonly feeOutPercent: BN

  constructor(fields: FeesFields) {
    this.feeInPercent = fields.feeInPercent
    this.feeOutPercent = fields.feeOutPercent
  }

  static layout(property?: string) {
    return borsh.struct(
      [borsh.u64("feeInPercent"), borsh.u64("feeOutPercent")],
      property
    )
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  static fromDecoded(obj: any) {
    return new Fees({
      feeInPercent: obj.feeInPercent,
      feeOutPercent: obj.feeOutPercent,
    })
  }

  static toEncodable(fields: FeesFields) {
    return {
      feeInPercent: fields.feeInPercent,
      feeOutPercent: fields.feeOutPercent,
    }
  }

  toJSON(): FeesJSON {
    return {
      feeInPercent: this.feeInPercent.toString(),
      feeOutPercent: this.feeOutPercent.toString(),
    }
  }

  static fromJSON(obj: FeesJSON): Fees {
    return new Fees({
      feeInPercent: new BN(obj.feeInPercent),
      feeOutPercent: new BN(obj.feeOutPercent),
    })
  }

  toEncodable() {
    return Fees.toEncodable(this)
  }
}
