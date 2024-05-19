import { PublicKey } from "@solana/web3.js" // eslint-disable-line @typescript-eslint/no-unused-vars
import BN from "bn.js" // eslint-disable-line @typescript-eslint/no-unused-vars
import * as types from "../types" // eslint-disable-line @typescript-eslint/no-unused-vars
import * as borsh from "@project-serum/borsh"

export interface StateDataFields {
  needTakePnlCoin: BN
  needTakePnlPc: BN
  totalPnlPc: BN
  totalPnlCoin: BN
  poolOpenTime: BN
  padding: Array<BN>
  orderbookToInitTime: BN
  swapCoinInAmount: BN
  swapPcOutAmount: BN
  swapAccPcFee: BN
  swapPcInAmount: BN
  swapCoinOutAmount: BN
  swapAccCoinFee: BN
}

export interface StateDataJSON {
  needTakePnlCoin: string
  needTakePnlPc: string
  totalPnlPc: string
  totalPnlCoin: string
  poolOpenTime: string
  padding: Array<string>
  orderbookToInitTime: string
  swapCoinInAmount: string
  swapPcOutAmount: string
  swapAccPcFee: string
  swapPcInAmount: string
  swapCoinOutAmount: string
  swapAccCoinFee: string
}

export class StateData {
  readonly needTakePnlCoin: BN
  readonly needTakePnlPc: BN
  readonly totalPnlPc: BN
  readonly totalPnlCoin: BN
  readonly poolOpenTime: BN
  readonly padding: Array<BN>
  readonly orderbookToInitTime: BN
  readonly swapCoinInAmount: BN
  readonly swapPcOutAmount: BN
  readonly swapAccPcFee: BN
  readonly swapPcInAmount: BN
  readonly swapCoinOutAmount: BN
  readonly swapAccCoinFee: BN

  constructor(fields: StateDataFields) {
    this.needTakePnlCoin = fields.needTakePnlCoin
    this.needTakePnlPc = fields.needTakePnlPc
    this.totalPnlPc = fields.totalPnlPc
    this.totalPnlCoin = fields.totalPnlCoin
    this.poolOpenTime = fields.poolOpenTime
    this.padding = fields.padding
    this.orderbookToInitTime = fields.orderbookToInitTime
    this.swapCoinInAmount = fields.swapCoinInAmount
    this.swapPcOutAmount = fields.swapPcOutAmount
    this.swapAccPcFee = fields.swapAccPcFee
    this.swapPcInAmount = fields.swapPcInAmount
    this.swapCoinOutAmount = fields.swapCoinOutAmount
    this.swapAccCoinFee = fields.swapAccCoinFee
  }

  static layout(property?: string) {
    return borsh.struct(
      [
        borsh.u64("needTakePnlCoin"),
        borsh.u64("needTakePnlPc"),
        borsh.u64("totalPnlPc"),
        borsh.u64("totalPnlCoin"),
        borsh.u64("poolOpenTime"),
        borsh.array(borsh.u64(), 2, "padding"),
        borsh.u64("orderbookToInitTime"),
        borsh.u128("swapCoinInAmount"),
        borsh.u128("swapPcOutAmount"),
        borsh.u64("swapAccPcFee"),
        borsh.u128("swapPcInAmount"),
        borsh.u128("swapCoinOutAmount"),
        borsh.u64("swapAccCoinFee"),
      ],
      property
    )
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  static fromDecoded(obj: any) {
    return new StateData({
      needTakePnlCoin: obj.needTakePnlCoin,
      needTakePnlPc: obj.needTakePnlPc,
      totalPnlPc: obj.totalPnlPc,
      totalPnlCoin: obj.totalPnlCoin,
      poolOpenTime: obj.poolOpenTime,
      padding: obj.padding,
      orderbookToInitTime: obj.orderbookToInitTime,
      swapCoinInAmount: obj.swapCoinInAmount,
      swapPcOutAmount: obj.swapPcOutAmount,
      swapAccPcFee: obj.swapAccPcFee,
      swapPcInAmount: obj.swapPcInAmount,
      swapCoinOutAmount: obj.swapCoinOutAmount,
      swapAccCoinFee: obj.swapAccCoinFee,
    })
  }

  static toEncodable(fields: StateDataFields) {
    return {
      needTakePnlCoin: fields.needTakePnlCoin,
      needTakePnlPc: fields.needTakePnlPc,
      totalPnlPc: fields.totalPnlPc,
      totalPnlCoin: fields.totalPnlCoin,
      poolOpenTime: fields.poolOpenTime,
      padding: fields.padding,
      orderbookToInitTime: fields.orderbookToInitTime,
      swapCoinInAmount: fields.swapCoinInAmount,
      swapPcOutAmount: fields.swapPcOutAmount,
      swapAccPcFee: fields.swapAccPcFee,
      swapPcInAmount: fields.swapPcInAmount,
      swapCoinOutAmount: fields.swapCoinOutAmount,
      swapAccCoinFee: fields.swapAccCoinFee,
    }
  }

  toJSON(): StateDataJSON {
    return {
      needTakePnlCoin: this.needTakePnlCoin.toString(),
      needTakePnlPc: this.needTakePnlPc.toString(),
      totalPnlPc: this.totalPnlPc.toString(),
      totalPnlCoin: this.totalPnlCoin.toString(),
      poolOpenTime: this.poolOpenTime.toString(),
      padding: this.padding.map((item) => item.toString()),
      orderbookToInitTime: this.orderbookToInitTime.toString(),
      swapCoinInAmount: this.swapCoinInAmount.toString(),
      swapPcOutAmount: this.swapPcOutAmount.toString(),
      swapAccPcFee: this.swapAccPcFee.toString(),
      swapPcInAmount: this.swapPcInAmount.toString(),
      swapCoinOutAmount: this.swapCoinOutAmount.toString(),
      swapAccCoinFee: this.swapAccCoinFee.toString(),
    }
  }

  static fromJSON(obj: StateDataJSON): StateData {
    return new StateData({
      needTakePnlCoin: new BN(obj.needTakePnlCoin),
      needTakePnlPc: new BN(obj.needTakePnlPc),
      totalPnlPc: new BN(obj.totalPnlPc),
      totalPnlCoin: new BN(obj.totalPnlCoin),
      poolOpenTime: new BN(obj.poolOpenTime),
      padding: obj.padding.map((item) => new BN(item)),
      orderbookToInitTime: new BN(obj.orderbookToInitTime),
      swapCoinInAmount: new BN(obj.swapCoinInAmount),
      swapPcOutAmount: new BN(obj.swapPcOutAmount),
      swapAccPcFee: new BN(obj.swapAccPcFee),
      swapPcInAmount: new BN(obj.swapPcInAmount),
      swapCoinOutAmount: new BN(obj.swapCoinOutAmount),
      swapAccCoinFee: new BN(obj.swapAccCoinFee),
    })
  }

  toEncodable() {
    return StateData.toEncodable(this)
  }
}
