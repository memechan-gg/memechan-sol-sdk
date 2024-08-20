import { PublicKey, Connection } from "@solana/web3.js";
import BN from "bn.js"; // eslint-disable-line @typescript-eslint/no-unused-vars
import * as borsh from "@project-serum/borsh"; // eslint-disable-line @typescript-eslint/no-unused-vars
import { PROGRAM_ID } from "../programId";

export interface RewardFields {
  mint: PublicKey;
  vault: PublicKey;
  number: BN;
  stakesTotal: BN;
  rewardAmount: BN;
  timestamp: BN;
  padding: Array<number>;
}

export interface RewardJSON {
  mint: string;
  vault: string;
  number: string;
  stakesTotal: string;
  rewardAmount: string;
  timestamp: string;
  padding: Array<number>;
}

export class Reward {
  readonly mint: PublicKey;
  readonly vault: PublicKey;
  readonly number: BN;
  readonly stakesTotal: BN;
  readonly rewardAmount: BN;
  readonly timestamp: BN;
  readonly padding: Array<number>;

  static readonly discriminator = Buffer.from([174, 129, 42, 212, 190, 18, 45, 34]);

  static readonly layout = borsh.struct([
    borsh.publicKey("mint"),
    borsh.publicKey("vault"),
    borsh.u64("number"),
    borsh.u64("stakesTotal"),
    borsh.u64("rewardAmount"),
    borsh.i64("timestamp"),
    borsh.array(borsh.u8(), 16, "padding"),
  ]);

  constructor(fields: RewardFields) {
    this.mint = fields.mint;
    this.vault = fields.vault;
    this.number = fields.number;
    this.stakesTotal = fields.stakesTotal;
    this.rewardAmount = fields.rewardAmount;
    this.timestamp = fields.timestamp;
    this.padding = fields.padding;
  }

  static async fetch(c: Connection, address: PublicKey): Promise<Reward | null> {
    const info = await c.getAccountInfo(address);

    if (info === null) {
      return null;
    }
    if (!info.owner.equals(PROGRAM_ID)) {
      throw new Error("account doesn't belong to this program");
    }

    return this.decode(info.data);
  }

  static async fetchMultiple(c: Connection, addresses: PublicKey[]): Promise<Array<Reward | null>> {
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

  static decode(data: Buffer): Reward {
    if (!data.slice(0, 8).equals(Reward.discriminator)) {
      throw new Error("invalid account discriminator");
    }

    const dec = Reward.layout.decode(data.slice(8));

    return new Reward({
      mint: dec.mint,
      vault: dec.vault,
      number: dec.number,
      stakesTotal: dec.stakesTotal,
      rewardAmount: dec.rewardAmount,
      timestamp: dec.timestamp,
      padding: dec.padding,
    });
  }

  toJSON(): RewardJSON {
    return {
      mint: this.mint.toString(),
      vault: this.vault.toString(),
      number: this.number.toString(),
      stakesTotal: this.stakesTotal.toString(),
      rewardAmount: this.rewardAmount.toString(),
      timestamp: this.timestamp.toString(),
      padding: this.padding,
    };
  }

  static fromJSON(obj: RewardJSON): Reward {
    return new Reward({
      mint: new PublicKey(obj.mint),
      vault: new PublicKey(obj.vault),
      number: new BN(obj.number),
      stakesTotal: new BN(obj.stakesTotal),
      rewardAmount: new BN(obj.rewardAmount),
      timestamp: new BN(obj.timestamp),
      padding: obj.padding,
    });
  }
}
