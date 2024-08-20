import { PublicKey, Connection } from "@solana/web3.js";
import BN from "bn.js"; // eslint-disable-line @typescript-eslint/no-unused-vars
import * as borsh from "@project-serum/borsh"; // eslint-disable-line @typescript-eslint/no-unused-vars
import { PROGRAM_ID } from "../programId";

export interface UserRewardsFields {
  owner: PublicKey;
  stake: PublicKey;
  rewardMint: PublicKey;
  withdrawnNumber: BN;
  padding: Array<number>;
}

export interface UserRewardsJSON {
  owner: string;
  stake: string;
  rewardMint: string;
  withdrawnNumber: string;
  padding: Array<number>;
}

export class UserRewards {
  readonly owner: PublicKey;
  readonly stake: PublicKey;
  readonly rewardMint: PublicKey;
  readonly withdrawnNumber: BN;
  readonly padding: Array<number>;

  static readonly discriminator = Buffer.from([188, 41, 210, 136, 171, 63, 155, 110]);

  static readonly layout = borsh.struct([
    borsh.publicKey("owner"),
    borsh.publicKey("stake"),
    borsh.publicKey("rewardMint"),
    borsh.u64("withdrawnNumber"),
    borsh.array(borsh.u8(), 8, "padding"),
  ]);

  constructor(fields: UserRewardsFields) {
    this.owner = fields.owner;
    this.stake = fields.stake;
    this.rewardMint = fields.rewardMint;
    this.withdrawnNumber = fields.withdrawnNumber;
    this.padding = fields.padding;
  }

  static async fetch(c: Connection, address: PublicKey): Promise<UserRewards | null> {
    const info = await c.getAccountInfo(address);

    if (info === null) {
      return null;
    }
    if (!info.owner.equals(PROGRAM_ID)) {
      throw new Error("account doesn't belong to this program");
    }

    return this.decode(info.data);
  }

  static async fetchMultiple(c: Connection, addresses: PublicKey[]): Promise<Array<UserRewards | null>> {
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

  static decode(data: Buffer): UserRewards {
    if (!data.slice(0, 8).equals(UserRewards.discriminator)) {
      throw new Error("invalid account discriminator");
    }

    const dec = UserRewards.layout.decode(data.slice(8));

    return new UserRewards({
      owner: dec.owner,
      stake: dec.stake,
      rewardMint: dec.rewardMint,
      withdrawnNumber: dec.withdrawnNumber,
      padding: dec.padding,
    });
  }

  toJSON(): UserRewardsJSON {
    return {
      owner: this.owner.toString(),
      stake: this.stake.toString(),
      rewardMint: this.rewardMint.toString(),
      withdrawnNumber: this.withdrawnNumber.toString(),
      padding: this.padding,
    };
  }

  static fromJSON(obj: UserRewardsJSON): UserRewards {
    return new UserRewards({
      owner: new PublicKey(obj.owner),
      stake: new PublicKey(obj.stake),
      rewardMint: new PublicKey(obj.rewardMint),
      withdrawnNumber: new BN(obj.withdrawnNumber),
      padding: obj.padding,
    });
  }
}
