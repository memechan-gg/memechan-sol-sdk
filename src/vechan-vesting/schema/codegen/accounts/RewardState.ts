import { PublicKey, Connection } from "@solana/web3.js";
import BN from "bn.js"; // eslint-disable-line @typescript-eslint/no-unused-vars
import * as borsh from "@project-serum/borsh"; // eslint-disable-line @typescript-eslint/no-unused-vars
import { PROGRAM_ID } from "../programId";

export interface RewardStateFields {
  mint: PublicKey;
  stakingState: PublicKey;
  latestRewardNumber: BN;
  padding: Array<number>;
}

export interface RewardStateJSON {
  mint: string;
  stakingState: string;
  latestRewardNumber: string;
  padding: Array<number>;
}

export class RewardState {
  readonly mint: PublicKey;
  readonly stakingState: PublicKey;
  readonly latestRewardNumber: BN;
  readonly padding: Array<number>;

  static readonly discriminator = Buffer.from([86, 245, 149, 170, 90, 108, 31, 251]);

  static readonly layout = borsh.struct([
    borsh.publicKey("mint"),
    borsh.publicKey("stakingState"),
    borsh.u64("latestRewardNumber"),
    borsh.array(borsh.u8(), 16, "padding"),
  ]);

  constructor(fields: RewardStateFields) {
    this.mint = fields.mint;
    this.stakingState = fields.stakingState;
    this.latestRewardNumber = fields.latestRewardNumber;
    this.padding = fields.padding;
  }

  static async fetch(c: Connection, address: PublicKey): Promise<RewardState | null> {
    const info = await c.getAccountInfo(address);

    if (info === null) {
      return null;
    }
    if (!info.owner.equals(PROGRAM_ID)) {
      throw new Error("account doesn't belong to this program");
    }

    return this.decode(info.data);
  }

  static async fetchMultiple(c: Connection, addresses: PublicKey[]): Promise<Array<RewardState | null>> {
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

  static decode(data: Buffer): RewardState {
    if (!data.slice(0, 8).equals(RewardState.discriminator)) {
      throw new Error("invalid account discriminator");
    }

    const dec = RewardState.layout.decode(data.slice(8));

    return new RewardState({
      mint: dec.mint,
      stakingState: dec.stakingState,
      latestRewardNumber: dec.latestRewardNumber,
      padding: dec.padding,
    });
  }

  toJSON(): RewardStateJSON {
    return {
      mint: this.mint.toString(),
      stakingState: this.stakingState.toString(),
      latestRewardNumber: this.latestRewardNumber.toString(),
      padding: this.padding,
    };
  }

  static fromJSON(obj: RewardStateJSON): RewardState {
    return new RewardState({
      mint: new PublicKey(obj.mint),
      stakingState: new PublicKey(obj.stakingState),
      latestRewardNumber: new BN(obj.latestRewardNumber),
      padding: obj.padding,
    });
  }
}
