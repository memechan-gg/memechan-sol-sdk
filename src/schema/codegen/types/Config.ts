import { PublicKey } from "@solana/web3.js" // eslint-disable-line @typescript-eslint/no-unused-vars
import BN from "bn.js" // eslint-disable-line @typescript-eslint/no-unused-vars
import * as types from "../types" // eslint-disable-line @typescript-eslint/no-unused-vars
import * as borsh from "@project-serum/borsh"

export interface ConfigFields {
  alphaAbs: BN
  beta: BN
  priceFactor: BN
  gammaS: BN
  gammaM: BN
  omegaM: BN
}

export interface ConfigJSON {
  alphaAbs: string
  beta: string
  priceFactor: string
  gammaS: string
  gammaM: string
  omegaM: string
}

export class Config {
  readonly alphaAbs: BN
  readonly beta: BN
  readonly priceFactor: BN
  readonly gammaS: BN
  readonly gammaM: BN
  readonly omegaM: BN

  constructor(fields: ConfigFields) {
    this.alphaAbs = fields.alphaAbs
    this.beta = fields.beta
    this.priceFactor = fields.priceFactor
    this.gammaS = fields.gammaS
    this.gammaM = fields.gammaM
    this.omegaM = fields.omegaM
  }

  static layout(property?: string) {
    return borsh.struct(
      [
        borsh.u128("alphaAbs"),
        borsh.u128("beta"),
        borsh.u64("priceFactor"),
        borsh.u64("gammaS"),
        borsh.u64("gammaM"),
        borsh.u64("omegaM"),
      ],
      property
    )
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  static fromDecoded(obj: any) {
    return new Config({
      alphaAbs: obj.alphaAbs,
      beta: obj.beta,
      priceFactor: obj.priceFactor,
      gammaS: obj.gammaS,
      gammaM: obj.gammaM,
      omegaM: obj.omegaM,
    })
  }

  static toEncodable(fields: ConfigFields) {
    return {
      alphaAbs: fields.alphaAbs,
      beta: fields.beta,
      priceFactor: fields.priceFactor,
      gammaS: fields.gammaS,
      gammaM: fields.gammaM,
      omegaM: fields.omegaM,
    }
  }

  toJSON(): ConfigJSON {
    return {
      alphaAbs: this.alphaAbs.toString(),
      beta: this.beta.toString(),
      priceFactor: this.priceFactor.toString(),
      gammaS: this.gammaS.toString(),
      gammaM: this.gammaM.toString(),
      omegaM: this.omegaM.toString(),
    }
  }

  static fromJSON(obj: ConfigJSON): Config {
    return new Config({
      alphaAbs: new BN(obj.alphaAbs),
      beta: new BN(obj.beta),
      priceFactor: new BN(obj.priceFactor),
      gammaS: new BN(obj.gammaS),
      gammaM: new BN(obj.gammaM),
      omegaM: new BN(obj.omegaM),
    })
  }

  toEncodable() {
    return Config.toEncodable(this)
  }
}
