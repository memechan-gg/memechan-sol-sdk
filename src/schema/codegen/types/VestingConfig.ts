import { PublicKey } from "@solana/web3.js" // eslint-disable-line @typescript-eslint/no-unused-vars
import BN from "bn.js" // eslint-disable-line @typescript-eslint/no-unused-vars
import * as types from "../types" // eslint-disable-line @typescript-eslint/no-unused-vars
import * as borsh from "@project-serum/borsh"

export interface VestingConfigFields {
  startTs: BN
  cliffTs: BN
  endTs: BN
}

export interface VestingConfigJSON {
  startTs: string
  cliffTs: string
  endTs: string
}

export class VestingConfig {
  readonly startTs: BN
  readonly cliffTs: BN
  readonly endTs: BN

  constructor(fields: VestingConfigFields) {
    this.startTs = fields.startTs
    this.cliffTs = fields.cliffTs
    this.endTs = fields.endTs
  }

  static layout(property?: string) {
    return borsh.struct(
      [borsh.i64("startTs"), borsh.i64("cliffTs"), borsh.i64("endTs")],
      property
    )
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  static fromDecoded(obj: any) {
    return new VestingConfig({
      startTs: obj.startTs,
      cliffTs: obj.cliffTs,
      endTs: obj.endTs,
    })
  }

  static toEncodable(fields: VestingConfigFields) {
    return {
      startTs: fields.startTs,
      cliffTs: fields.cliffTs,
      endTs: fields.endTs,
    }
  }

  toJSON(): VestingConfigJSON {
    return {
      startTs: this.startTs.toString(),
      cliffTs: this.cliffTs.toString(),
      endTs: this.endTs.toString(),
    }
  }

  static fromJSON(obj: VestingConfigJSON): VestingConfig {
    return new VestingConfig({
      startTs: new BN(obj.startTs),
      cliffTs: new BN(obj.cliffTs),
      endTs: new BN(obj.endTs),
    })
  }

  toEncodable() {
    return VestingConfig.toEncodable(this)
  }
}
