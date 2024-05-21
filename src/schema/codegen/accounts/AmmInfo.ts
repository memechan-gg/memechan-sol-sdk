import { PublicKey, Connection } from "@solana/web3.js"
import BN from "bn.js" // eslint-disable-line @typescript-eslint/no-unused-vars
import * as borsh from "@project-serum/borsh" // eslint-disable-line @typescript-eslint/no-unused-vars
import * as types from "../types" // eslint-disable-line @typescript-eslint/no-unused-vars
import { PROGRAM_ID } from "../programId"

export interface AmmInfoFields {
  status: BN
  nonce: BN
  orderNum: BN
  depth: BN
  coinDecimals: BN
  pcDecimals: BN
  state: BN
  resetFlag: BN
  minSize: BN
  volMaxCutRatio: BN
  amountWave: BN
  coinLotSize: BN
  pcLotSize: BN
  minPriceMultiplier: BN
  maxPriceMultiplier: BN
  sysDecimalValue: BN
  fees: types.RaydiumFeesFields
  stateData: types.StateDataFields
  coinVault: PublicKey
  pcVault: PublicKey
  coinVaultMint: PublicKey
  pcVaultMint: PublicKey
  lpMint: PublicKey
  openOrders: PublicKey
  market: PublicKey
  marketProgram: PublicKey
  targetOrders: PublicKey
  padding1: Array<BN>
  ammOwner: PublicKey
  lpAmount: BN
  clientOrderId: BN
  padding2: Array<BN>
}

export interface AmmInfoJSON {
  status: string
  nonce: string
  orderNum: string
  depth: string
  coinDecimals: string
  pcDecimals: string
  state: string
  resetFlag: string
  minSize: string
  volMaxCutRatio: string
  amountWave: string
  coinLotSize: string
  pcLotSize: string
  minPriceMultiplier: string
  maxPriceMultiplier: string
  sysDecimalValue: string
  fees: types.RaydiumFeesJSON
  stateData: types.StateDataJSON
  coinVault: string
  pcVault: string
  coinVaultMint: string
  pcVaultMint: string
  lpMint: string
  openOrders: string
  market: string
  marketProgram: string
  targetOrders: string
  padding1: Array<string>
  ammOwner: string
  lpAmount: string
  clientOrderId: string
  padding2: Array<string>
}

export class AmmInfo {
  readonly status: BN
  readonly nonce: BN
  readonly orderNum: BN
  readonly depth: BN
  readonly coinDecimals: BN
  readonly pcDecimals: BN
  readonly state: BN
  readonly resetFlag: BN
  readonly minSize: BN
  readonly volMaxCutRatio: BN
  readonly amountWave: BN
  readonly coinLotSize: BN
  readonly pcLotSize: BN
  readonly minPriceMultiplier: BN
  readonly maxPriceMultiplier: BN
  readonly sysDecimalValue: BN
  readonly fees: types.RaydiumFees
  readonly stateData: types.StateData
  readonly coinVault: PublicKey
  readonly pcVault: PublicKey
  readonly coinVaultMint: PublicKey
  readonly pcVaultMint: PublicKey
  readonly lpMint: PublicKey
  readonly openOrders: PublicKey
  readonly market: PublicKey
  readonly marketProgram: PublicKey
  readonly targetOrders: PublicKey
  readonly padding1: Array<BN>
  readonly ammOwner: PublicKey
  readonly lpAmount: BN
  readonly clientOrderId: BN
  readonly padding2: Array<BN>

  static readonly discriminator = Buffer.from([
    33, 217, 2, 203, 184, 83, 235, 91,
  ])

  static readonly layout = borsh.struct([
    borsh.u64("status"),
    borsh.u64("nonce"),
    borsh.u64("orderNum"),
    borsh.u64("depth"),
    borsh.u64("coinDecimals"),
    borsh.u64("pcDecimals"),
    borsh.u64("state"),
    borsh.u64("resetFlag"),
    borsh.u64("minSize"),
    borsh.u64("volMaxCutRatio"),
    borsh.u64("amountWave"),
    borsh.u64("coinLotSize"),
    borsh.u64("pcLotSize"),
    borsh.u64("minPriceMultiplier"),
    borsh.u64("maxPriceMultiplier"),
    borsh.u64("sysDecimalValue"),
    types.RaydiumFees.layout("fees"),
    types.StateData.layout("stateData"),
    borsh.publicKey("coinVault"),
    borsh.publicKey("pcVault"),
    borsh.publicKey("coinVaultMint"),
    borsh.publicKey("pcVaultMint"),
    borsh.publicKey("lpMint"),
    borsh.publicKey("openOrders"),
    borsh.publicKey("market"),
    borsh.publicKey("marketProgram"),
    borsh.publicKey("targetOrders"),
    borsh.array(borsh.u64(), 8, "padding1"),
    borsh.publicKey("ammOwner"),
    borsh.u64("lpAmount"),
    borsh.u64("clientOrderId"),
    borsh.array(borsh.u64(), 2, "padding2"),
  ])

  constructor(fields: AmmInfoFields) {
    this.status = fields.status
    this.nonce = fields.nonce
    this.orderNum = fields.orderNum
    this.depth = fields.depth
    this.coinDecimals = fields.coinDecimals
    this.pcDecimals = fields.pcDecimals
    this.state = fields.state
    this.resetFlag = fields.resetFlag
    this.minSize = fields.minSize
    this.volMaxCutRatio = fields.volMaxCutRatio
    this.amountWave = fields.amountWave
    this.coinLotSize = fields.coinLotSize
    this.pcLotSize = fields.pcLotSize
    this.minPriceMultiplier = fields.minPriceMultiplier
    this.maxPriceMultiplier = fields.maxPriceMultiplier
    this.sysDecimalValue = fields.sysDecimalValue
    this.fees = new types.RaydiumFees({ ...fields.fees })
    this.stateData = new types.StateData({ ...fields.stateData })
    this.coinVault = fields.coinVault
    this.pcVault = fields.pcVault
    this.coinVaultMint = fields.coinVaultMint
    this.pcVaultMint = fields.pcVaultMint
    this.lpMint = fields.lpMint
    this.openOrders = fields.openOrders
    this.market = fields.market
    this.marketProgram = fields.marketProgram
    this.targetOrders = fields.targetOrders
    this.padding1 = fields.padding1
    this.ammOwner = fields.ammOwner
    this.lpAmount = fields.lpAmount
    this.clientOrderId = fields.clientOrderId
    this.padding2 = fields.padding2
  }

  static async fetch(
    c: Connection,
    address: PublicKey
  ): Promise<AmmInfo | null> {
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
  ): Promise<Array<AmmInfo | null>> {
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

  static decode(data: Buffer): AmmInfo {
    if (!data.slice(0, 8).equals(AmmInfo.discriminator)) {
      throw new Error("invalid account discriminator")
    }

    const dec = AmmInfo.layout.decode(data.slice(8))

    return new AmmInfo({
      status: dec.status,
      nonce: dec.nonce,
      orderNum: dec.orderNum,
      depth: dec.depth,
      coinDecimals: dec.coinDecimals,
      pcDecimals: dec.pcDecimals,
      state: dec.state,
      resetFlag: dec.resetFlag,
      minSize: dec.minSize,
      volMaxCutRatio: dec.volMaxCutRatio,
      amountWave: dec.amountWave,
      coinLotSize: dec.coinLotSize,
      pcLotSize: dec.pcLotSize,
      minPriceMultiplier: dec.minPriceMultiplier,
      maxPriceMultiplier: dec.maxPriceMultiplier,
      sysDecimalValue: dec.sysDecimalValue,
      fees: types.RaydiumFees.fromDecoded(dec.fees),
      stateData: types.StateData.fromDecoded(dec.stateData),
      coinVault: dec.coinVault,
      pcVault: dec.pcVault,
      coinVaultMint: dec.coinVaultMint,
      pcVaultMint: dec.pcVaultMint,
      lpMint: dec.lpMint,
      openOrders: dec.openOrders,
      market: dec.market,
      marketProgram: dec.marketProgram,
      targetOrders: dec.targetOrders,
      padding1: dec.padding1,
      ammOwner: dec.ammOwner,
      lpAmount: dec.lpAmount,
      clientOrderId: dec.clientOrderId,
      padding2: dec.padding2,
    })
  }

  toJSON(): AmmInfoJSON {
    return {
      status: this.status.toString(),
      nonce: this.nonce.toString(),
      orderNum: this.orderNum.toString(),
      depth: this.depth.toString(),
      coinDecimals: this.coinDecimals.toString(),
      pcDecimals: this.pcDecimals.toString(),
      state: this.state.toString(),
      resetFlag: this.resetFlag.toString(),
      minSize: this.minSize.toString(),
      volMaxCutRatio: this.volMaxCutRatio.toString(),
      amountWave: this.amountWave.toString(),
      coinLotSize: this.coinLotSize.toString(),
      pcLotSize: this.pcLotSize.toString(),
      minPriceMultiplier: this.minPriceMultiplier.toString(),
      maxPriceMultiplier: this.maxPriceMultiplier.toString(),
      sysDecimalValue: this.sysDecimalValue.toString(),
      fees: this.fees.toJSON(),
      stateData: this.stateData.toJSON(),
      coinVault: this.coinVault.toString(),
      pcVault: this.pcVault.toString(),
      coinVaultMint: this.coinVaultMint.toString(),
      pcVaultMint: this.pcVaultMint.toString(),
      lpMint: this.lpMint.toString(),
      openOrders: this.openOrders.toString(),
      market: this.market.toString(),
      marketProgram: this.marketProgram.toString(),
      targetOrders: this.targetOrders.toString(),
      padding1: this.padding1.map((item) => item.toString()),
      ammOwner: this.ammOwner.toString(),
      lpAmount: this.lpAmount.toString(),
      clientOrderId: this.clientOrderId.toString(),
      padding2: this.padding2.map((item) => item.toString()),
    }
  }

  static fromJSON(obj: AmmInfoJSON): AmmInfo {
    return new AmmInfo({
      status: new BN(obj.status),
      nonce: new BN(obj.nonce),
      orderNum: new BN(obj.orderNum),
      depth: new BN(obj.depth),
      coinDecimals: new BN(obj.coinDecimals),
      pcDecimals: new BN(obj.pcDecimals),
      state: new BN(obj.state),
      resetFlag: new BN(obj.resetFlag),
      minSize: new BN(obj.minSize),
      volMaxCutRatio: new BN(obj.volMaxCutRatio),
      amountWave: new BN(obj.amountWave),
      coinLotSize: new BN(obj.coinLotSize),
      pcLotSize: new BN(obj.pcLotSize),
      minPriceMultiplier: new BN(obj.minPriceMultiplier),
      maxPriceMultiplier: new BN(obj.maxPriceMultiplier),
      sysDecimalValue: new BN(obj.sysDecimalValue),
      fees: types.RaydiumFees.fromJSON(obj.fees),
      stateData: types.StateData.fromJSON(obj.stateData),
      coinVault: new PublicKey(obj.coinVault),
      pcVault: new PublicKey(obj.pcVault),
      coinVaultMint: new PublicKey(obj.coinVaultMint),
      pcVaultMint: new PublicKey(obj.pcVaultMint),
      lpMint: new PublicKey(obj.lpMint),
      openOrders: new PublicKey(obj.openOrders),
      market: new PublicKey(obj.market),
      marketProgram: new PublicKey(obj.marketProgram),
      targetOrders: new PublicKey(obj.targetOrders),
      padding1: obj.padding1.map((item) => new BN(item)),
      ammOwner: new PublicKey(obj.ammOwner),
      lpAmount: new BN(obj.lpAmount),
      clientOrderId: new BN(obj.clientOrderId),
      padding2: obj.padding2.map((item) => new BN(item)),
    })
  }
}
