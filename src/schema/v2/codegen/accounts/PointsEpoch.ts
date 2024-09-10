import { PublicKey, Connection } from "@solana/web3.js";
import BN from "bn.js"; // eslint-disable-line @typescript-eslint/no-unused-vars
import * as borsh from "@project-serum/borsh"; // eslint-disable-line @typescript-eslint/no-unused-vars
import * as types from "../types"; // eslint-disable-line @typescript-eslint/no-unused-vars
import { PROGRAM_ID } from "../programId";

export interface PointsEpochFields {
  epochNumber: BN;
  pointsPerSolNum: BN;
  pointsPerSolDenom: BN;
  padding: Array<number>;
}

export interface PointsEpochJSON {
  epochNumber: string;
  pointsPerSolNum: string;
  pointsPerSolDenom: string;
  padding: Array<number>;
}

export class PointsEpoch {
  readonly epochNumber: BN;
  readonly pointsPerSolNum: BN;
  readonly pointsPerSolDenom: BN;
  readonly padding: Array<number>;

  static readonly discriminator = Buffer.from([154, 7, 96, 121, 150, 115, 162, 242]);

  static readonly layout = borsh.struct([
    borsh.u64("epochNumber"),
    borsh.u64("pointsPerSolNum"),
    borsh.u64("pointsPerSolDenom"),
    borsh.array(borsh.u8(), 8, "padding"),
  ]);

  constructor(fields: PointsEpochFields) {
    this.epochNumber = fields.epochNumber;
    this.pointsPerSolNum = fields.pointsPerSolNum;
    this.pointsPerSolDenom = fields.pointsPerSolDenom;
    this.padding = fields.padding;
  }

  static async fetch(c: Connection, address: PublicKey): Promise<PointsEpoch | null> {
    const info = await c.getAccountInfo(address);

    if (info === null) {
      return null;
    }
    if (!info.owner.equals(PROGRAM_ID)) {
      throw new Error("account doesn't belong to this program");
    }

    return this.decode(info.data);
  }

  static async fetchMultiple(c: Connection, addresses: PublicKey[]): Promise<Array<PointsEpoch | null>> {
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

  static decode(data: Buffer): PointsEpoch {
    if (!data.slice(0, 8).equals(PointsEpoch.discriminator)) {
      throw new Error("invalid account discriminator");
    }

    const dec = PointsEpoch.layout.decode(data.slice(8));

    return new PointsEpoch({
      epochNumber: dec.epochNumber,
      pointsPerSolNum: dec.pointsPerSolNum,
      pointsPerSolDenom: dec.pointsPerSolDenom,
      padding: dec.padding,
    });
  }

  toJSON(): PointsEpochJSON {
    return {
      epochNumber: this.epochNumber.toString(),
      pointsPerSolNum: this.pointsPerSolNum.toString(),
      pointsPerSolDenom: this.pointsPerSolDenom.toString(),
      padding: this.padding,
    };
  }

  static fromJSON(obj: PointsEpochJSON): PointsEpoch {
    return new PointsEpoch({
      epochNumber: new BN(obj.epochNumber),
      pointsPerSolNum: new BN(obj.pointsPerSolNum),
      pointsPerSolDenom: new BN(obj.pointsPerSolDenom),
      padding: obj.padding,
    });
  }
}
