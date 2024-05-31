import { PublicKey, Connection } from "@solana/web3.js";
import BN from "bn.js"; // eslint-disable-line @typescript-eslint/no-unused-vars
import * as borsh from "@project-serum/borsh"; // eslint-disable-line @typescript-eslint/no-unused-vars
import * as types from "../types"; // eslint-disable-line @typescript-eslint/no-unused-vars
import { PROGRAM_ID } from "../programId";

export interface MarketStateFields {
  accountFlags: BN;
  ownAddress: Array<BN>;
  vaultSignerNonce: BN;
  coinMint: Array<BN>;
  pcMint: Array<BN>;
  coinVault: Array<BN>;
  coinDepositsTotal: BN;
  coinFeesAccrued: BN;
  pcVault: Array<BN>;
  pcDepositsTotal: BN;
  pcFeesAccrued: BN;
  pcDustThreshold: BN;
  reqQ: Array<BN>;
  eventQ: Array<BN>;
  bids: Array<BN>;
  asks: Array<BN>;
  coinLotSize: BN;
  pcLotSize: BN;
  feeRateBps: BN;
  referrerRebatesAccrued: BN;
}

export interface MarketStateJSON {
  accountFlags: string;
  ownAddress: Array<string>;
  vaultSignerNonce: string;
  coinMint: Array<string>;
  pcMint: Array<string>;
  coinVault: Array<string>;
  coinDepositsTotal: string;
  coinFeesAccrued: string;
  pcVault: Array<string>;
  pcDepositsTotal: string;
  pcFeesAccrued: string;
  pcDustThreshold: string;
  reqQ: Array<string>;
  eventQ: Array<string>;
  bids: Array<string>;
  asks: Array<string>;
  coinLotSize: string;
  pcLotSize: string;
  feeRateBps: string;
  referrerRebatesAccrued: string;
}

export class MarketState {
  readonly accountFlags: BN;
  readonly ownAddress: Array<BN>;
  readonly vaultSignerNonce: BN;
  readonly coinMint: Array<BN>;
  readonly pcMint: Array<BN>;
  readonly coinVault: Array<BN>;
  readonly coinDepositsTotal: BN;
  readonly coinFeesAccrued: BN;
  readonly pcVault: Array<BN>;
  readonly pcDepositsTotal: BN;
  readonly pcFeesAccrued: BN;
  readonly pcDustThreshold: BN;
  readonly reqQ: Array<BN>;
  readonly eventQ: Array<BN>;
  readonly bids: Array<BN>;
  readonly asks: Array<BN>;
  readonly coinLotSize: BN;
  readonly pcLotSize: BN;
  readonly feeRateBps: BN;
  readonly referrerRebatesAccrued: BN;

  static readonly discriminator = Buffer.from([0, 125, 123, 215, 95, 96, 164, 194]);

  static readonly layout = borsh.struct([
    borsh.u64("accountFlags"),
    borsh.array(borsh.u64(), 4, "ownAddress"),
    borsh.u64("vaultSignerNonce"),
    borsh.array(borsh.u64(), 4, "coinMint"),
    borsh.array(borsh.u64(), 4, "pcMint"),
    borsh.array(borsh.u64(), 4, "coinVault"),
    borsh.u64("coinDepositsTotal"),
    borsh.u64("coinFeesAccrued"),
    borsh.array(borsh.u64(), 4, "pcVault"),
    borsh.u64("pcDepositsTotal"),
    borsh.u64("pcFeesAccrued"),
    borsh.u64("pcDustThreshold"),
    borsh.array(borsh.u64(), 4, "reqQ"),
    borsh.array(borsh.u64(), 4, "eventQ"),
    borsh.array(borsh.u64(), 4, "bids"),
    borsh.array(borsh.u64(), 4, "asks"),
    borsh.u64("coinLotSize"),
    borsh.u64("pcLotSize"),
    borsh.u64("feeRateBps"),
    borsh.u64("referrerRebatesAccrued"),
  ]);

  constructor(fields: MarketStateFields) {
    this.accountFlags = fields.accountFlags;
    this.ownAddress = fields.ownAddress;
    this.vaultSignerNonce = fields.vaultSignerNonce;
    this.coinMint = fields.coinMint;
    this.pcMint = fields.pcMint;
    this.coinVault = fields.coinVault;
    this.coinDepositsTotal = fields.coinDepositsTotal;
    this.coinFeesAccrued = fields.coinFeesAccrued;
    this.pcVault = fields.pcVault;
    this.pcDepositsTotal = fields.pcDepositsTotal;
    this.pcFeesAccrued = fields.pcFeesAccrued;
    this.pcDustThreshold = fields.pcDustThreshold;
    this.reqQ = fields.reqQ;
    this.eventQ = fields.eventQ;
    this.bids = fields.bids;
    this.asks = fields.asks;
    this.coinLotSize = fields.coinLotSize;
    this.pcLotSize = fields.pcLotSize;
    this.feeRateBps = fields.feeRateBps;
    this.referrerRebatesAccrued = fields.referrerRebatesAccrued;
  }

  static async fetch(c: Connection, address: PublicKey): Promise<MarketState | null> {
    const info = await c.getAccountInfo(address);

    if (info === null) {
      return null;
    }
    if (!info.owner.equals(PROGRAM_ID)) {
      throw new Error("account doesn't belong to this program");
    }

    return this.decode(info.data);
  }

  static async fetchMultiple(c: Connection, addresses: PublicKey[]): Promise<Array<MarketState | null>> {
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

  static decode(data: Buffer): MarketState {
    if (!data.slice(0, 8).equals(MarketState.discriminator)) {
      throw new Error("invalid account discriminator");
    }

    const dec = MarketState.layout.decode(data.slice(8));

    return new MarketState({
      accountFlags: dec.accountFlags,
      ownAddress: dec.ownAddress,
      vaultSignerNonce: dec.vaultSignerNonce,
      coinMint: dec.coinMint,
      pcMint: dec.pcMint,
      coinVault: dec.coinVault,
      coinDepositsTotal: dec.coinDepositsTotal,
      coinFeesAccrued: dec.coinFeesAccrued,
      pcVault: dec.pcVault,
      pcDepositsTotal: dec.pcDepositsTotal,
      pcFeesAccrued: dec.pcFeesAccrued,
      pcDustThreshold: dec.pcDustThreshold,
      reqQ: dec.reqQ,
      eventQ: dec.eventQ,
      bids: dec.bids,
      asks: dec.asks,
      coinLotSize: dec.coinLotSize,
      pcLotSize: dec.pcLotSize,
      feeRateBps: dec.feeRateBps,
      referrerRebatesAccrued: dec.referrerRebatesAccrued,
    });
  }

  toJSON(): MarketStateJSON {
    return {
      accountFlags: this.accountFlags.toString(),
      ownAddress: this.ownAddress.map((item) => item.toString()),
      vaultSignerNonce: this.vaultSignerNonce.toString(),
      coinMint: this.coinMint.map((item) => item.toString()),
      pcMint: this.pcMint.map((item) => item.toString()),
      coinVault: this.coinVault.map((item) => item.toString()),
      coinDepositsTotal: this.coinDepositsTotal.toString(),
      coinFeesAccrued: this.coinFeesAccrued.toString(),
      pcVault: this.pcVault.map((item) => item.toString()),
      pcDepositsTotal: this.pcDepositsTotal.toString(),
      pcFeesAccrued: this.pcFeesAccrued.toString(),
      pcDustThreshold: this.pcDustThreshold.toString(),
      reqQ: this.reqQ.map((item) => item.toString()),
      eventQ: this.eventQ.map((item) => item.toString()),
      bids: this.bids.map((item) => item.toString()),
      asks: this.asks.map((item) => item.toString()),
      coinLotSize: this.coinLotSize.toString(),
      pcLotSize: this.pcLotSize.toString(),
      feeRateBps: this.feeRateBps.toString(),
      referrerRebatesAccrued: this.referrerRebatesAccrued.toString(),
    };
  }

  static fromJSON(obj: MarketStateJSON): MarketState {
    return new MarketState({
      accountFlags: new BN(obj.accountFlags),
      ownAddress: obj.ownAddress.map((item) => new BN(item)),
      vaultSignerNonce: new BN(obj.vaultSignerNonce),
      coinMint: obj.coinMint.map((item) => new BN(item)),
      pcMint: obj.pcMint.map((item) => new BN(item)),
      coinVault: obj.coinVault.map((item) => new BN(item)),
      coinDepositsTotal: new BN(obj.coinDepositsTotal),
      coinFeesAccrued: new BN(obj.coinFeesAccrued),
      pcVault: obj.pcVault.map((item) => new BN(item)),
      pcDepositsTotal: new BN(obj.pcDepositsTotal),
      pcFeesAccrued: new BN(obj.pcFeesAccrued),
      pcDustThreshold: new BN(obj.pcDustThreshold),
      reqQ: obj.reqQ.map((item) => new BN(item)),
      eventQ: obj.eventQ.map((item) => new BN(item)),
      bids: obj.bids.map((item) => new BN(item)),
      asks: obj.asks.map((item) => new BN(item)),
      coinLotSize: new BN(obj.coinLotSize),
      pcLotSize: new BN(obj.pcLotSize),
      feeRateBps: new BN(obj.feeRateBps),
      referrerRebatesAccrued: new BN(obj.referrerRebatesAccrued),
    });
  }
}
