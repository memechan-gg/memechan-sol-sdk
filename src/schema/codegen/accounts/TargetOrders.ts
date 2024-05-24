import { PublicKey, Connection } from "@solana/web3.js"
import BN from "bn.js" // eslint-disable-line @typescript-eslint/no-unused-vars
import * as borsh from "@project-serum/borsh" // eslint-disable-line @typescript-eslint/no-unused-vars
import * as types from "../types" // eslint-disable-line @typescript-eslint/no-unused-vars
import { PROGRAM_ID } from "../programId"

export interface TargetOrdersFields {
  owner: Array<BN>
  buyOrders: Array<types.TargetOrderFields>
  padding1: Array<BN>
  targetX: BN
  targetY: BN
  planXBuy: BN
  planYBuy: BN
  planXSell: BN
  planYSell: BN
  placedX: BN
  placedY: BN
  calcPnlX: BN
  calcPnlY: BN
  sellOrders: Array<types.TargetOrderFields>
  padding2: Array<BN>
  replaceBuyClientId: Array<BN>
  replaceSellClientId: Array<BN>
  lastOrderNumerator: BN
  lastOrderDenominator: BN
  planOrdersCur: BN
  placeOrdersCur: BN
  validBuyOrderNum: BN
  validSellOrderNum: BN
  padding3: Array<BN>
  freeSlotBits: BN
}

export interface TargetOrdersJSON {
  owner: Array<string>
  buyOrders: Array<types.TargetOrderJSON>
  padding1: Array<string>
  targetX: string
  targetY: string
  planXBuy: string
  planYBuy: string
  planXSell: string
  planYSell: string
  placedX: string
  placedY: string
  calcPnlX: string
  calcPnlY: string
  sellOrders: Array<types.TargetOrderJSON>
  padding2: Array<string>
  replaceBuyClientId: Array<string>
  replaceSellClientId: Array<string>
  lastOrderNumerator: string
  lastOrderDenominator: string
  planOrdersCur: string
  placeOrdersCur: string
  validBuyOrderNum: string
  validSellOrderNum: string
  padding3: Array<string>
  freeSlotBits: string
}

export class TargetOrders {
  readonly owner: Array<BN>
  readonly buyOrders: Array<types.TargetOrder>
  readonly padding1: Array<BN>
  readonly targetX: BN
  readonly targetY: BN
  readonly planXBuy: BN
  readonly planYBuy: BN
  readonly planXSell: BN
  readonly planYSell: BN
  readonly placedX: BN
  readonly placedY: BN
  readonly calcPnlX: BN
  readonly calcPnlY: BN
  readonly sellOrders: Array<types.TargetOrder>
  readonly padding2: Array<BN>
  readonly replaceBuyClientId: Array<BN>
  readonly replaceSellClientId: Array<BN>
  readonly lastOrderNumerator: BN
  readonly lastOrderDenominator: BN
  readonly planOrdersCur: BN
  readonly placeOrdersCur: BN
  readonly validBuyOrderNum: BN
  readonly validSellOrderNum: BN
  readonly padding3: Array<BN>
  readonly freeSlotBits: BN

  static readonly discriminator = Buffer.from([
    113, 225, 140, 255, 65, 144, 239, 231,
  ])

  static readonly layout = borsh.struct([
    borsh.array(borsh.u64(), 4, "owner"),
    borsh.array(types.TargetOrder.layout(), 50, "buyOrders"),
    borsh.array(borsh.u64(), 8, "padding1"),
    borsh.u128("targetX"),
    borsh.u128("targetY"),
    borsh.u128("planXBuy"),
    borsh.u128("planYBuy"),
    borsh.u128("planXSell"),
    borsh.u128("planYSell"),
    borsh.u128("placedX"),
    borsh.u128("placedY"),
    borsh.u128("calcPnlX"),
    borsh.u128("calcPnlY"),
    borsh.array(types.TargetOrder.layout(), 50, "sellOrders"),
    borsh.array(borsh.u64(), 6, "padding2"),
    borsh.array(borsh.u64(), 10, "replaceBuyClientId"),
    borsh.array(borsh.u64(), 10, "replaceSellClientId"),
    borsh.u64("lastOrderNumerator"),
    borsh.u64("lastOrderDenominator"),
    borsh.u64("planOrdersCur"),
    borsh.u64("placeOrdersCur"),
    borsh.u64("validBuyOrderNum"),
    borsh.u64("validSellOrderNum"),
    borsh.array(borsh.u64(), 10, "padding3"),
    borsh.u128("freeSlotBits"),
  ])

  constructor(fields: TargetOrdersFields) {
    this.owner = fields.owner
    this.buyOrders = fields.buyOrders.map(
      (item) => new types.TargetOrder({ ...item })
    )
    this.padding1 = fields.padding1
    this.targetX = fields.targetX
    this.targetY = fields.targetY
    this.planXBuy = fields.planXBuy
    this.planYBuy = fields.planYBuy
    this.planXSell = fields.planXSell
    this.planYSell = fields.planYSell
    this.placedX = fields.placedX
    this.placedY = fields.placedY
    this.calcPnlX = fields.calcPnlX
    this.calcPnlY = fields.calcPnlY
    this.sellOrders = fields.sellOrders.map(
      (item) => new types.TargetOrder({ ...item })
    )
    this.padding2 = fields.padding2
    this.replaceBuyClientId = fields.replaceBuyClientId
    this.replaceSellClientId = fields.replaceSellClientId
    this.lastOrderNumerator = fields.lastOrderNumerator
    this.lastOrderDenominator = fields.lastOrderDenominator
    this.planOrdersCur = fields.planOrdersCur
    this.placeOrdersCur = fields.placeOrdersCur
    this.validBuyOrderNum = fields.validBuyOrderNum
    this.validSellOrderNum = fields.validSellOrderNum
    this.padding3 = fields.padding3
    this.freeSlotBits = fields.freeSlotBits
  }

  static async fetch(
    c: Connection,
    address: PublicKey
  ): Promise<TargetOrders | null> {
    const info = await c.getAccountInfo(address)

    if (info === null) {
      return null
    }
    if (!info.owner.equals(PROGRAM_ID)) {
      throw new Error("account doesn't belong to this program")
    }

    return this.decode(info.data)
  }

  static async fetchMultiple(
    c: Connection,
    addresses: PublicKey[]
  ): Promise<Array<TargetOrders | null>> {
    const infos = await c.getMultipleAccountsInfo(addresses)

    return infos.map((info) => {
      if (info === null) {
        return null
      }
      if (!info.owner.equals(PROGRAM_ID)) {
        throw new Error("account doesn't belong to this program")
      }

      return this.decode(info.data)
    })
  }

  static decode(data: Buffer): TargetOrders {
    if (!data.slice(0, 8).equals(TargetOrders.discriminator)) {
      throw new Error("invalid account discriminator")
    }

    const dec = TargetOrders.layout.decode(data.slice(8))

    return new TargetOrders({
      owner: dec.owner,
      buyOrders: dec.buyOrders.map((item: unknown) =>
        types.TargetOrder.fromDecoded(item)
      ),
      padding1: dec.padding1,
      targetX: dec.targetX,
      targetY: dec.targetY,
      planXBuy: dec.planXBuy,
      planYBuy: dec.planYBuy,
      planXSell: dec.planXSell,
      planYSell: dec.planYSell,
      placedX: dec.placedX,
      placedY: dec.placedY,
      calcPnlX: dec.calcPnlX,
      calcPnlY: dec.calcPnlY,
      sellOrders: dec.sellOrders.map((item: unknown) =>
        types.TargetOrder.fromDecoded(item)
      ),
      padding2: dec.padding2,
      replaceBuyClientId: dec.replaceBuyClientId,
      replaceSellClientId: dec.replaceSellClientId,
      lastOrderNumerator: dec.lastOrderNumerator,
      lastOrderDenominator: dec.lastOrderDenominator,
      planOrdersCur: dec.planOrdersCur,
      placeOrdersCur: dec.placeOrdersCur,
      validBuyOrderNum: dec.validBuyOrderNum,
      validSellOrderNum: dec.validSellOrderNum,
      padding3: dec.padding3,
      freeSlotBits: dec.freeSlotBits,
    })
  }

  toJSON(): TargetOrdersJSON {
    return {
      owner: this.owner.map((item) => item.toString()),
      buyOrders: this.buyOrders.map((item) => item.toJSON()),
      padding1: this.padding1.map((item) => item.toString()),
      targetX: this.targetX.toString(),
      targetY: this.targetY.toString(),
      planXBuy: this.planXBuy.toString(),
      planYBuy: this.planYBuy.toString(),
      planXSell: this.planXSell.toString(),
      planYSell: this.planYSell.toString(),
      placedX: this.placedX.toString(),
      placedY: this.placedY.toString(),
      calcPnlX: this.calcPnlX.toString(),
      calcPnlY: this.calcPnlY.toString(),
      sellOrders: this.sellOrders.map((item) => item.toJSON()),
      padding2: this.padding2.map((item) => item.toString()),
      replaceBuyClientId: this.replaceBuyClientId.map((item) =>
        item.toString()
      ),
      replaceSellClientId: this.replaceSellClientId.map((item) =>
        item.toString()
      ),
      lastOrderNumerator: this.lastOrderNumerator.toString(),
      lastOrderDenominator: this.lastOrderDenominator.toString(),
      planOrdersCur: this.planOrdersCur.toString(),
      placeOrdersCur: this.placeOrdersCur.toString(),
      validBuyOrderNum: this.validBuyOrderNum.toString(),
      validSellOrderNum: this.validSellOrderNum.toString(),
      padding3: this.padding3.map((item) => item.toString()),
      freeSlotBits: this.freeSlotBits.toString(),
    }
  }

  static fromJSON(obj: TargetOrdersJSON): TargetOrders {
    return new TargetOrders({
      owner: obj.owner.map((item) => new BN(item)),
      buyOrders: obj.buyOrders.map((item) => types.TargetOrder.fromJSON(item)),
      padding1: obj.padding1.map((item) => new BN(item)),
      targetX: new BN(obj.targetX),
      targetY: new BN(obj.targetY),
      planXBuy: new BN(obj.planXBuy),
      planYBuy: new BN(obj.planYBuy),
      planXSell: new BN(obj.planXSell),
      planYSell: new BN(obj.planYSell),
      placedX: new BN(obj.placedX),
      placedY: new BN(obj.placedY),
      calcPnlX: new BN(obj.calcPnlX),
      calcPnlY: new BN(obj.calcPnlY),
      sellOrders: obj.sellOrders.map((item) =>
        types.TargetOrder.fromJSON(item)
      ),
      padding2: obj.padding2.map((item) => new BN(item)),
      replaceBuyClientId: obj.replaceBuyClientId.map((item) => new BN(item)),
      replaceSellClientId: obj.replaceSellClientId.map((item) => new BN(item)),
      lastOrderNumerator: new BN(obj.lastOrderNumerator),
      lastOrderDenominator: new BN(obj.lastOrderDenominator),
      planOrdersCur: new BN(obj.planOrdersCur),
      placeOrdersCur: new BN(obj.placeOrdersCur),
      validBuyOrderNum: new BN(obj.validBuyOrderNum),
      validSellOrderNum: new BN(obj.validSellOrderNum),
      padding3: obj.padding3.map((item) => new BN(item)),
      freeSlotBits: new BN(obj.freeSlotBits),
    })
  }
}
