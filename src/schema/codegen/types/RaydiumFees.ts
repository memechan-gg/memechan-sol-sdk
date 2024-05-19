import { PublicKey } from "@solana/web3.js" // eslint-disable-line @typescript-eslint/no-unused-vars
import BN from "bn.js" // eslint-disable-line @typescript-eslint/no-unused-vars
import * as types from "../types" // eslint-disable-line @typescript-eslint/no-unused-vars
import * as borsh from "@project-serum/borsh"

export interface RaydiumFeesFields {
  minSeparateNumerator: BN
  minSeparateDenominator: BN
  tradeFeeNumerator: BN
  tradeFeeDenominator: BN
  pnlNumerator: BN
  pnlDenominator: BN
  swapFeeNumerator: BN
  swapFeeDenominator: BN
}

export interface RaydiumFeesJSON {
  minSeparateNumerator: string
  minSeparateDenominator: string
  tradeFeeNumerator: string
  tradeFeeDenominator: string
  pnlNumerator: string
  pnlDenominator: string
  swapFeeNumerator: string
  swapFeeDenominator: string
}

export class RaydiumFees {
  readonly minSeparateNumerator: BN
  readonly minSeparateDenominator: BN
  readonly tradeFeeNumerator: BN
  readonly tradeFeeDenominator: BN
  readonly pnlNumerator: BN
  readonly pnlDenominator: BN
  readonly swapFeeNumerator: BN
  readonly swapFeeDenominator: BN

  constructor(fields: RaydiumFeesFields) {
    this.minSeparateNumerator = fields.minSeparateNumerator
    this.minSeparateDenominator = fields.minSeparateDenominator
    this.tradeFeeNumerator = fields.tradeFeeNumerator
    this.tradeFeeDenominator = fields.tradeFeeDenominator
    this.pnlNumerator = fields.pnlNumerator
    this.pnlDenominator = fields.pnlDenominator
    this.swapFeeNumerator = fields.swapFeeNumerator
    this.swapFeeDenominator = fields.swapFeeDenominator
  }

  static layout(property?: string) {
    return borsh.struct(
      [
        borsh.u64("minSeparateNumerator"),
        borsh.u64("minSeparateDenominator"),
        borsh.u64("tradeFeeNumerator"),
        borsh.u64("tradeFeeDenominator"),
        borsh.u64("pnlNumerator"),
        borsh.u64("pnlDenominator"),
        borsh.u64("swapFeeNumerator"),
        borsh.u64("swapFeeDenominator"),
      ],
      property
    )
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  static fromDecoded(obj: any) {
    return new RaydiumFees({
      minSeparateNumerator: obj.minSeparateNumerator,
      minSeparateDenominator: obj.minSeparateDenominator,
      tradeFeeNumerator: obj.tradeFeeNumerator,
      tradeFeeDenominator: obj.tradeFeeDenominator,
      pnlNumerator: obj.pnlNumerator,
      pnlDenominator: obj.pnlDenominator,
      swapFeeNumerator: obj.swapFeeNumerator,
      swapFeeDenominator: obj.swapFeeDenominator,
    })
  }

  static toEncodable(fields: RaydiumFeesFields) {
    return {
      minSeparateNumerator: fields.minSeparateNumerator,
      minSeparateDenominator: fields.minSeparateDenominator,
      tradeFeeNumerator: fields.tradeFeeNumerator,
      tradeFeeDenominator: fields.tradeFeeDenominator,
      pnlNumerator: fields.pnlNumerator,
      pnlDenominator: fields.pnlDenominator,
      swapFeeNumerator: fields.swapFeeNumerator,
      swapFeeDenominator: fields.swapFeeDenominator,
    }
  }

  toJSON(): RaydiumFeesJSON {
    return {
      minSeparateNumerator: this.minSeparateNumerator.toString(),
      minSeparateDenominator: this.minSeparateDenominator.toString(),
      tradeFeeNumerator: this.tradeFeeNumerator.toString(),
      tradeFeeDenominator: this.tradeFeeDenominator.toString(),
      pnlNumerator: this.pnlNumerator.toString(),
      pnlDenominator: this.pnlDenominator.toString(),
      swapFeeNumerator: this.swapFeeNumerator.toString(),
      swapFeeDenominator: this.swapFeeDenominator.toString(),
    }
  }

  static fromJSON(obj: RaydiumFeesJSON): RaydiumFees {
    return new RaydiumFees({
      minSeparateNumerator: new BN(obj.minSeparateNumerator),
      minSeparateDenominator: new BN(obj.minSeparateDenominator),
      tradeFeeNumerator: new BN(obj.tradeFeeNumerator),
      tradeFeeDenominator: new BN(obj.tradeFeeDenominator),
      pnlNumerator: new BN(obj.pnlNumerator),
      pnlDenominator: new BN(obj.pnlDenominator),
      swapFeeNumerator: new BN(obj.swapFeeNumerator),
      swapFeeDenominator: new BN(obj.swapFeeDenominator),
    })
  }

  toEncodable() {
    return RaydiumFees.toEncodable(this)
  }
}
