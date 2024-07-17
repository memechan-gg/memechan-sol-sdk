import { PublicKey, Connection } from "@solana/web3.js";
import BN from "bn.js"; // eslint-disable-line @typescript-eslint/no-unused-vars
import * as borsh from "@project-serum/borsh"; // eslint-disable-line @typescript-eslint/no-unused-vars
import * as types from "../types"; // eslint-disable-line @typescript-eslint/no-unused-vars
import { PROGRAM_ID } from "../programId";

export interface OpenOrdersFields {
  accountFlags: BN;
  market: Array<BN>;
  owner: Array<BN>;
  nativeCoinFree: BN;
  nativeCoinTotal: BN;
  nativePcFree: BN;
  nativePcTotal: BN;
  freeSlotBits: BN;
  isBidBits: BN;
  orders: Array<BN>;
  clientOrderIds: Array<BN>;
  referrerRebatesAccrued: BN;
}

export interface OpenOrdersJSON {
  accountFlags: string;
  market: Array<string>;
  owner: Array<string>;
  nativeCoinFree: string;
  nativeCoinTotal: string;
  nativePcFree: string;
  nativePcTotal: string;
  freeSlotBits: string;
  isBidBits: string;
  orders: Array<string>;
  clientOrderIds: Array<string>;
  referrerRebatesAccrued: string;
}

export class OpenOrders {
  readonly accountFlags: BN;
  readonly market: Array<BN>;
  readonly owner: Array<BN>;
  readonly nativeCoinFree: BN;
  readonly nativeCoinTotal: BN;
  readonly nativePcFree: BN;
  readonly nativePcTotal: BN;
  readonly freeSlotBits: BN;
  readonly isBidBits: BN;
  readonly orders: Array<BN>;
  readonly clientOrderIds: Array<BN>;
  readonly referrerRebatesAccrued: BN;

  static readonly discriminator = Buffer.from([139, 166, 123, 206, 111, 2, 116, 33]);

  static readonly layout = borsh.struct([
    borsh.u64("accountFlags"),
    borsh.array(borsh.u64(), 4, "market"),
    borsh.array(borsh.u64(), 4, "owner"),
    borsh.u64("nativeCoinFree"),
    borsh.u64("nativeCoinTotal"),
    borsh.u64("nativePcFree"),
    borsh.u64("nativePcTotal"),
    borsh.u128("freeSlotBits"),
    borsh.u128("isBidBits"),
    borsh.array(borsh.u128(), 128, "orders"),
    borsh.array(borsh.u64(), 128, "clientOrderIds"),
    borsh.u64("referrerRebatesAccrued"),
  ]);

  constructor(fields: OpenOrdersFields) {
    this.accountFlags = fields.accountFlags;
    this.market = fields.market;
    this.owner = fields.owner;
    this.nativeCoinFree = fields.nativeCoinFree;
    this.nativeCoinTotal = fields.nativeCoinTotal;
    this.nativePcFree = fields.nativePcFree;
    this.nativePcTotal = fields.nativePcTotal;
    this.freeSlotBits = fields.freeSlotBits;
    this.isBidBits = fields.isBidBits;
    this.orders = fields.orders;
    this.clientOrderIds = fields.clientOrderIds;
    this.referrerRebatesAccrued = fields.referrerRebatesAccrued;
  }

  static async fetch(c: Connection, address: PublicKey): Promise<OpenOrders | null> {
    const info = await c.getAccountInfo(address);

    if (info === null) {
      return null;
    }
    if (!info.owner.equals(PROGRAM_ID)) {
      throw new Error("account doesn't belong to this program");
    }

    return this.decode(info.data);
  }

  static async fetchMultiple(c: Connection, addresses: PublicKey[]): Promise<Array<OpenOrders | null>> {
    const infos = await c.getMultipleAccountsInfo(addresses);

    return infos.map((info) => {
      if (info === null) {
        return null;
      }
      if (!info.owner.equals(PROGRAM_ID)) {
        throw new Error("account doesn't belong to this program");
      }

      return this.decode(info.data);
    });
  }

  static decode(data: Buffer): OpenOrders {
    if (!data.slice(0, 8).equals(OpenOrders.discriminator)) {
      throw new Error("invalid account discriminator");
    }

    const dec = OpenOrders.layout.decode(data.slice(8));

    return new OpenOrders({
      accountFlags: dec.accountFlags,
      market: dec.market,
      owner: dec.owner,
      nativeCoinFree: dec.nativeCoinFree,
      nativeCoinTotal: dec.nativeCoinTotal,
      nativePcFree: dec.nativePcFree,
      nativePcTotal: dec.nativePcTotal,
      freeSlotBits: dec.freeSlotBits,
      isBidBits: dec.isBidBits,
      orders: dec.orders,
      clientOrderIds: dec.clientOrderIds,
      referrerRebatesAccrued: dec.referrerRebatesAccrued,
    });
  }

  toJSON(): OpenOrdersJSON {
    return {
      accountFlags: this.accountFlags.toString(),
      market: this.market.map((item) => item.toString()),
      owner: this.owner.map((item) => item.toString()),
      nativeCoinFree: this.nativeCoinFree.toString(),
      nativeCoinTotal: this.nativeCoinTotal.toString(),
      nativePcFree: this.nativePcFree.toString(),
      nativePcTotal: this.nativePcTotal.toString(),
      freeSlotBits: this.freeSlotBits.toString(),
      isBidBits: this.isBidBits.toString(),
      orders: this.orders.map((item) => item.toString()),
      clientOrderIds: this.clientOrderIds.map((item) => item.toString()),
      referrerRebatesAccrued: this.referrerRebatesAccrued.toString(),
    };
  }

  static fromJSON(obj: OpenOrdersJSON): OpenOrders {
    return new OpenOrders({
      accountFlags: new BN(obj.accountFlags),
      market: obj.market.map((item) => new BN(item)),
      owner: obj.owner.map((item) => new BN(item)),
      nativeCoinFree: new BN(obj.nativeCoinFree),
      nativeCoinTotal: new BN(obj.nativeCoinTotal),
      nativePcFree: new BN(obj.nativePcFree),
      nativePcTotal: new BN(obj.nativePcTotal),
      freeSlotBits: new BN(obj.freeSlotBits),
      isBidBits: new BN(obj.isBidBits),
      orders: obj.orders.map((item) => new BN(item)),
      clientOrderIds: obj.clientOrderIds.map((item) => new BN(item)),
      referrerRebatesAccrued: new BN(obj.referrerRebatesAccrued),
    });
  }
}
