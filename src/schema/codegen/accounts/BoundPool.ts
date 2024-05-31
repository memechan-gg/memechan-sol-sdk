import { PublicKey, Connection } from "@solana/web3.js";
import BN from "bn.js"; // eslint-disable-line @typescript-eslint/no-unused-vars
import * as borsh from "@project-serum/borsh"; // eslint-disable-line @typescript-eslint/no-unused-vars
import * as types from "../types"; // eslint-disable-line @typescript-eslint/no-unused-vars
import { PROGRAM_ID } from "../programId";

export interface BoundPoolFields {
  memeReserve: types.ReserveFields;
  quoteReserve: types.ReserveFields;
  adminFeesMeme: BN;
  adminFeesQuote: BN;
  feeVaultQuote: PublicKey;
  creatorAddr: PublicKey;
  fees: types.FeesFields;
  config: types.ConfigFields;
  locked: boolean;
}

export interface BoundPoolJSON {
  memeReserve: types.ReserveJSON;
  quoteReserve: types.ReserveJSON;
  adminFeesMeme: string;
  adminFeesQuote: string;
  feeVaultQuote: string;
  creatorAddr: string;
  fees: types.FeesJSON;
  config: types.ConfigJSON;
  locked: boolean;
}

export class BoundPool {
  readonly memeReserve: types.Reserve;
  readonly quoteReserve: types.Reserve;
  readonly adminFeesMeme: BN;
  readonly adminFeesQuote: BN;
  readonly feeVaultQuote: PublicKey;
  readonly creatorAddr: PublicKey;
  readonly fees: types.Fees;
  readonly config: types.Config;
  readonly locked: boolean;

  static readonly discriminator = Buffer.from([191, 233, 118, 178, 14, 139, 241, 36]);

  static readonly layout = borsh.struct([
    types.Reserve.layout("memeReserve"),
    types.Reserve.layout("quoteReserve"),
    borsh.u64("adminFeesMeme"),
    borsh.u64("adminFeesQuote"),
    borsh.publicKey("adminVaultQuote"),
    borsh.publicKey("creatorAddr"),
    types.Fees.layout("fees"),
    types.Config.layout("config"),
    borsh.bool("locked"),
  ]);

  constructor(fields: BoundPoolFields) {
    this.memeReserve = new types.Reserve({ ...fields.memeReserve });
    this.quoteReserve = new types.Reserve({ ...fields.quoteReserve });
    this.adminFeesMeme = fields.adminFeesMeme;
    this.adminFeesQuote = fields.adminFeesQuote;
    this.feeVaultQuote = fields.feeVaultQuote;
    this.creatorAddr = fields.creatorAddr;
    this.fees = new types.Fees({ ...fields.fees });
    this.config = new types.Config({ ...fields.config });
    this.locked = fields.locked;
  }

  static async fetch(c: Connection, address: PublicKey): Promise<BoundPool | null> {
    const info = await c.getAccountInfo(address, { commitment: "confirmed" });

    if (info === null) {
      return null;
    }
    if (!info.owner.equals(PROGRAM_ID)) {
      throw new Error("account doesn't belong to this program");
    }

    return this.decode(info.data);
  }

  static async fetchMultiple(c: Connection, addresses: PublicKey[]): Promise<Array<BoundPool | null>> {
    const infos = await c.getMultipleAccountsInfo(addresses, { commitment: "confirmed" });

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

  static decode(data: Buffer): BoundPool {
    if (!data.slice(0, 8).equals(BoundPool.discriminator)) {
      throw new Error("invalid account discriminator");
    }

    const dec = BoundPool.layout.decode(data.slice(8));

    return new BoundPool({
      memeReserve: types.Reserve.fromDecoded(dec.memeReserve),
      quoteReserve: types.Reserve.fromDecoded(dec.quoteReserve),
      adminFeesMeme: dec.adminFeesMeme,
      adminFeesQuote: dec.adminFeesQuote,
      feeVaultQuote: dec.feeVaultQuote,
      creatorAddr: dec.creatorAddr,
      fees: types.Fees.fromDecoded(dec.fees),
      config: types.Config.fromDecoded(dec.config),
      locked: dec.locked,
    });
  }

  toJSON(): BoundPoolJSON {
    return {
      memeReserve: this.memeReserve.toJSON(),
      quoteReserve: this.quoteReserve.toJSON(),
      adminFeesMeme: this.adminFeesMeme.toString(),
      adminFeesQuote: this.adminFeesQuote.toString(),
      feeVaultQuote: this.feeVaultQuote.toString(),
      creatorAddr: this.creatorAddr.toString(),
      fees: this.fees.toJSON(),
      config: this.config.toJSON(),
      locked: this.locked,
    };
  }

  static fromJSON(obj: BoundPoolJSON): BoundPool {
    return new BoundPool({
      memeReserve: types.Reserve.fromJSON(obj.memeReserve),
      quoteReserve: types.Reserve.fromJSON(obj.quoteReserve),
      adminFeesMeme: new BN(obj.adminFeesMeme),
      adminFeesQuote: new BN(obj.adminFeesQuote),
      feeVaultQuote: new PublicKey(obj.feeVaultQuote),
      creatorAddr: new PublicKey(obj.creatorAddr),
      fees: types.Fees.fromJSON(obj.fees),
      config: types.Config.fromJSON(obj.config),
      locked: obj.locked,
    });
  }
}
