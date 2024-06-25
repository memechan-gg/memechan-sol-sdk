import { PublicKey, Connection } from "@solana/web3.js";
import BN from "bn.js"; // eslint-disable-line @typescript-eslint/no-unused-vars
import * as borsh from "@project-serum/borsh"; // eslint-disable-line @typescript-eslint/no-unused-vars
import * as types from "../types"; // eslint-disable-line @typescript-eslint/no-unused-vars
import { PROGRAM_ID } from "../programId";

export interface MemeTicketFields {
  owner: PublicKey;
  pool: PublicKey;
  amount: BN;
  withdrawsMeme: BN;
  withdrawsQuote: BN;
  withdrawsChan: BN;
  untilTimestamp: BN;
  vesting: types.VestingDataFields;
}

export interface MemeTicketJSON {
  owner: string;
  pool: string;
  amount: string;
  withdrawsMeme: string;
  withdrawsQuote: string;
  withdrawsChan: string;
  untilTimestamp: string;
  vesting: types.VestingDataJSON;
}

export class MemeTicket {
  readonly owner: PublicKey;
  readonly pool: PublicKey;
  readonly amount: BN;
  readonly withdrawsMeme: BN;
  readonly withdrawsQuote: BN;
  readonly withdrawsChan: BN;
  readonly untilTimestamp: BN;
  readonly vesting: types.VestingData;

  static readonly discriminator = Buffer.from([58, 7, 92, 66, 230, 111, 95, 247]);

  static readonly layout = borsh.struct([
    borsh.publicKey("owner"),
    borsh.publicKey("pool"),
    borsh.u64("amount"),
    borsh.u64("withdrawsMeme"),
    borsh.u64("withdrawsQuote"),
    borsh.u64("withdrawsChan"),
    borsh.i64("untilTimestamp"),
    types.VestingData.layout("vesting"),
  ]);

  constructor(fields: MemeTicketFields) {
    this.owner = fields.owner;
    this.pool = fields.pool;
    this.amount = fields.amount;
    this.withdrawsMeme = fields.withdrawsMeme;
    this.withdrawsQuote = fields.withdrawsQuote;
    this.withdrawsChan = fields.withdrawsChan;
    this.untilTimestamp = fields.untilTimestamp;
    this.vesting = new types.VestingData({ ...fields.vesting });
  }

  static async fetch(c: Connection, address: PublicKey): Promise<MemeTicket | null> {
    const info = await c.getAccountInfo(address);

    if (info === null) {
      return null;
    }
    if (!info.owner.equals(PROGRAM_ID)) {
      throw new Error("account doesn't belong to this program");
    }

    return this.decode(info.data);
  }

  static async fetchMultiple(c: Connection, addresses: PublicKey[]): Promise<Array<MemeTicket | null>> {
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

  static decode(data: Buffer): MemeTicket {
    if (!data.slice(0, 8).equals(MemeTicket.discriminator)) {
      throw new Error("invalid account discriminator");
    }

    const dec = MemeTicket.layout.decode(data.slice(8));

    return new MemeTicket({
      owner: dec.owner,
      pool: dec.pool,
      amount: dec.amount,
      withdrawsMeme: dec.withdrawsMeme,
      withdrawsQuote: dec.withdrawsQuote,
      withdrawsChan: dec.withdrawsChan,
      untilTimestamp: dec.untilTimestamp,
      vesting: types.VestingData.fromDecoded(dec.vesting),
    });
  }

  toJSON(): MemeTicketJSON {
    return {
      owner: this.owner.toString(),
      pool: this.pool.toString(),
      amount: this.amount.toString(),
      withdrawsMeme: this.withdrawsMeme.toString(),
      withdrawsQuote: this.withdrawsQuote.toString(),
      withdrawsChan: this.withdrawsChan.toString(),
      untilTimestamp: this.untilTimestamp.toString(),
      vesting: this.vesting.toJSON(),
    };
  }

  static fromJSON(obj: MemeTicketJSON): MemeTicket {
    return new MemeTicket({
      owner: new PublicKey(obj.owner),
      pool: new PublicKey(obj.pool),
      amount: new BN(obj.amount),
      withdrawsMeme: new BN(obj.withdrawsMeme),
      withdrawsQuote: new BN(obj.withdrawsQuote),
      withdrawsChan: new BN(obj.withdrawsChan),
      untilTimestamp: new BN(obj.untilTimestamp),
      vesting: types.VestingData.fromJSON(obj.vesting),
    });
  }
}
