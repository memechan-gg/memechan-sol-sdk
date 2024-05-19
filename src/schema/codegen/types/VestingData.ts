import { PublicKey } from "@solana/web3.js" // eslint-disable-line @typescript-eslint/no-unused-vars
import BN from "bn.js" // eslint-disable-line @typescript-eslint/no-unused-vars
import * as types from "../types" // eslint-disable-line @typescript-eslint/no-unused-vars
import * as borsh from "@project-serum/borsh"

export interface VestingDataFields {
  released: BN
  notional: BN
}

export interface VestingDataJSON {
  released: string
  notional: string
}

export class VestingData {
  readonly released: BN
  readonly notional: BN

  constructor(fields: VestingDataFields) {
    this.released = fields.released
    this.notional = fields.notional
  }

  static layout(property?: string) {
    return borsh.struct(
      [borsh.u64("released"), borsh.u64("notional")],
      property
    )
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  static fromDecoded(obj: any) {
    return new VestingData({
      released: obj.released,
      notional: obj.notional,
    })
  }

  static toEncodable(fields: VestingDataFields) {
    return {
      released: fields.released,
      notional: fields.notional,
    }
  }

  toJSON(): VestingDataJSON {
    return {
      released: this.released.toString(),
      notional: this.notional.toString(),
    }
  }

  static fromJSON(obj: VestingDataJSON): VestingData {
    return new VestingData({
      released: new BN(obj.released),
      notional: new BN(obj.notional),
    })
  }

  toEncodable() {
    return VestingData.toEncodable(this)
  }
}
