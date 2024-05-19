import { PublicKey, Connection } from "@solana/web3.js"
import BN from "bn.js" // eslint-disable-line @typescript-eslint/no-unused-vars
import * as borsh from "@project-serum/borsh" // eslint-disable-line @typescript-eslint/no-unused-vars
import * as types from "../types" // eslint-disable-line @typescript-eslint/no-unused-vars
import { PROGRAM_ID } from "../programId"

export interface AmmConfigFields {
  pnlOwner: PublicKey
  cancelOwner: PublicKey
  pending1: Array<BN>
  pending2: Array<BN>
  createPoolFee: BN
}

export interface AmmConfigJSON {
  pnlOwner: string
  cancelOwner: string
  pending1: Array<string>
  pending2: Array<string>
  createPoolFee: string
}

export class AmmConfig {
  readonly pnlOwner: PublicKey
  readonly cancelOwner: PublicKey
  readonly pending1: Array<BN>
  readonly pending2: Array<BN>
  readonly createPoolFee: BN

  static readonly discriminator = Buffer.from([
    218, 244, 33, 104, 203, 203, 43, 111,
  ])

  static readonly layout = borsh.struct([
    borsh.publicKey("pnlOwner"),
    borsh.publicKey("cancelOwner"),
    borsh.array(borsh.u64(), 28, "pending1"),
    borsh.array(borsh.u64(), 31, "pending2"),
    borsh.u64("createPoolFee"),
  ])

  constructor(fields: AmmConfigFields) {
    this.pnlOwner = fields.pnlOwner
    this.cancelOwner = fields.cancelOwner
    this.pending1 = fields.pending1
    this.pending2 = fields.pending2
    this.createPoolFee = fields.createPoolFee
  }

  static async fetch(
    c: Connection,
    address: PublicKey
  ): Promise<AmmConfig | null> {
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
  ): Promise<Array<AmmConfig | null>> {
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

  static decode(data: Buffer): AmmConfig {
    if (!data.slice(0, 8).equals(AmmConfig.discriminator)) {
      throw new Error("invalid account discriminator")
    }

    const dec = AmmConfig.layout.decode(data.slice(8))

    return new AmmConfig({
      pnlOwner: dec.pnlOwner,
      cancelOwner: dec.cancelOwner,
      pending1: dec.pending1,
      pending2: dec.pending2,
      createPoolFee: dec.createPoolFee,
    })
  }

  toJSON(): AmmConfigJSON {
    return {
      pnlOwner: this.pnlOwner.toString(),
      cancelOwner: this.cancelOwner.toString(),
      pending1: this.pending1.map((item) => item.toString()),
      pending2: this.pending2.map((item) => item.toString()),
      createPoolFee: this.createPoolFee.toString(),
    }
  }

  static fromJSON(obj: AmmConfigJSON): AmmConfig {
    return new AmmConfig({
      pnlOwner: new PublicKey(obj.pnlOwner),
      cancelOwner: new PublicKey(obj.cancelOwner),
      pending1: obj.pending1.map((item) => new BN(item)),
      pending2: obj.pending2.map((item) => new BN(item)),
      createPoolFee: new BN(obj.createPoolFee),
    })
  }
}
