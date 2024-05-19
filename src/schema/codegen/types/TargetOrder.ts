import { PublicKey } from "@solana/web3.js" // eslint-disable-line @typescript-eslint/no-unused-vars
import BN from "bn.js" // eslint-disable-line @typescript-eslint/no-unused-vars
import * as types from "../types" // eslint-disable-line @typescript-eslint/no-unused-vars
import * as borsh from "@project-serum/borsh"

export interface TargetOrderFields {
  price: BN
  vol: BN
}

export interface TargetOrderJSON {
  price: string
  vol: string
}

export class TargetOrder {
  readonly price: BN
  readonly vol: BN

  constructor(fields: TargetOrderFields) {
    this.price = fields.price
    this.vol = fields.vol
  }

  static layout(property?: string) {
    return borsh.struct([borsh.u64("price"), borsh.u64("vol")], property)
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  static fromDecoded(obj: any) {
    return new TargetOrder({
      price: obj.price,
      vol: obj.vol,
    })
  }

  static toEncodable(fields: TargetOrderFields) {
    return {
      price: fields.price,
      vol: fields.vol,
    }
  }

  toJSON(): TargetOrderJSON {
    return {
      price: this.price.toString(),
      vol: this.vol.toString(),
    }
  }

  static fromJSON(obj: TargetOrderJSON): TargetOrder {
    return new TargetOrder({
      price: new BN(obj.price),
      vol: new BN(obj.vol),
    })
  }

  toEncodable() {
    return TargetOrder.toEncodable(this)
  }
}
