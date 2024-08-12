import { PublicKey, Connection } from "@solana/web3.js";
import BN from "bn.js"; // eslint-disable-line @typescript-eslint/no-unused-vars
import * as borsh from "@project-serum/borsh"; // eslint-disable-line @typescript-eslint/no-unused-vars
import * as types from "../types"; // eslint-disable-line @typescript-eslint/no-unused-vars
import { PROGRAM_ID } from "../programId";

export interface UserStatsFields {
  isInitialized: boolean;
  pool: PublicKey;
  referral: PublicKey;
  memeFees: BN;
  quoteFees: BN;
  memeReceived: BN;
  quoteReceived: BN;
  chanReceived: BN;
  padding: Array<number>;
}

export interface UserStatsJSON {
  isInitialized: boolean;
  pool: string;
  referral: string;
  memeFees: string;
  quoteFees: string;
  memeReceived: string;
  quoteReceived: string;
  chanReceived: string;
  padding: Array<number>;
}

export class UserStats {
  readonly isInitialized: boolean;
  readonly pool: PublicKey;
  readonly referral: PublicKey;
  readonly memeFees: BN;
  readonly quoteFees: BN;
  readonly memeReceived: BN;
  readonly quoteReceived: BN;
  readonly chanReceived: BN;
  readonly padding: Array<number>;

  static readonly discriminator = Buffer.from([176, 223, 136, 27, 122, 79, 32, 227]);

  static readonly layout = borsh.struct([
    borsh.bool("isInitialized"),
    borsh.publicKey("pool"),
    borsh.publicKey("referral"),
    borsh.u64("memeFees"),
    borsh.u64("quoteFees"),
    borsh.u64("memeReceived"),
    borsh.u64("quoteReceived"),
    borsh.u64("chanReceived"),
    borsh.array(borsh.u8(), 8, "padding"),
  ]);

  constructor(fields: UserStatsFields) {
    this.isInitialized = fields.isInitialized;
    this.pool = fields.pool;
    this.referral = fields.referral;
    this.memeFees = fields.memeFees;
    this.quoteFees = fields.quoteFees;
    this.memeReceived = fields.memeReceived;
    this.quoteReceived = fields.quoteReceived;
    this.chanReceived = fields.chanReceived;
    this.padding = fields.padding;
  }

  static async fetch(c: Connection, address: PublicKey): Promise<UserStats | null> {
    const info = await c.getAccountInfo(address);

    if (info === null) {
      return null;
    }
    if (!info.owner.equals(PROGRAM_ID)) {
      throw new Error("account doesn't belong to this program");
    }

    return this.decode(info.data);
  }

  static async fetchMultiple(c: Connection, addresses: PublicKey[]): Promise<Array<UserStats | null>> {
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

  static decode(data: Buffer): UserStats {
    if (!data.slice(0, 8).equals(UserStats.discriminator)) {
      throw new Error("invalid account discriminator");
    }

    const dec = UserStats.layout.decode(data.slice(8));

    return new UserStats({
      isInitialized: dec.isInitialized,
      pool: dec.pool,
      referral: dec.referral,
      memeFees: dec.memeFees,
      quoteFees: dec.quoteFees,
      memeReceived: dec.memeReceived,
      quoteReceived: dec.quoteReceived,
      chanReceived: dec.chanReceived,
      padding: dec.padding,
    });
  }

  toJSON(): UserStatsJSON {
    return {
      isInitialized: this.isInitialized,
      pool: this.pool.toString(),
      referral: this.referral.toString(),
      memeFees: this.memeFees.toString(),
      quoteFees: this.quoteFees.toString(),
      memeReceived: this.memeReceived.toString(),
      quoteReceived: this.quoteReceived.toString(),
      chanReceived: this.chanReceived.toString(),
      padding: this.padding,
    };
  }

  static fromJSON(obj: UserStatsJSON): UserStats {
    return new UserStats({
      isInitialized: obj.isInitialized,
      pool: new PublicKey(obj.pool),
      referral: new PublicKey(obj.referral),
      memeFees: new BN(obj.memeFees),
      quoteFees: new BN(obj.quoteFees),
      memeReceived: new BN(obj.memeReceived),
      quoteReceived: new BN(obj.quoteReceived),
      chanReceived: new BN(obj.chanReceived),
      padding: obj.padding,
    });
  }
}
