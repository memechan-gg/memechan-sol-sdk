import { PublicKey, Connection } from "@solana/web3.js";
import BN from "bn.js"; // eslint-disable-line @typescript-eslint/no-unused-vars
import * as borsh from "@project-serum/borsh"; // eslint-disable-line @typescript-eslint/no-unused-vars
import { PROGRAM_ID } from "../programId";

export interface StakingStateFields {
  vMint: PublicKey;
  veMint: PublicKey;
  veTotal: BN;
  padding: Array<number>;
}

export interface StakingStateJSON {
  vMint: string;
  veMint: string;
  veTotal: string;
  padding: Array<number>;
}

export class StakingState {
  readonly vMint: PublicKey;
  readonly veMint: PublicKey;
  readonly veTotal: BN;
  readonly padding: Array<number>;

  static readonly discriminator = Buffer.from([152, 226, 234, 201, 202, 8, 155, 60]);

  static readonly layout = borsh.struct([
    borsh.publicKey("vMint"),
    borsh.publicKey("veMint"),
    borsh.u64("veTotal"),
    borsh.array(borsh.u8(), 16, "padding"),
  ]);

  constructor(fields: StakingStateFields) {
    this.vMint = fields.vMint;
    this.veMint = fields.veMint;
    this.veTotal = fields.veTotal;
    this.padding = fields.padding;
  }

  static async fetch(c: Connection, address: PublicKey): Promise<StakingState | null> {
    const info = await c.getAccountInfo(address);

    if (info === null) {
      return null;
    }
    if (!info.owner.equals(PROGRAM_ID)) {
      throw new Error("account doesn't belong to this program");
    }

    return this.decode(info.data);
  }

  static async fetchMultiple(c: Connection, addresses: PublicKey[]): Promise<Array<StakingState | null>> {
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

  static decode(data: Buffer): StakingState {
    if (!data.slice(0, 8).equals(StakingState.discriminator)) {
      throw new Error("invalid account discriminator");
    }

    const dec = StakingState.layout.decode(data.slice(8));

    return new StakingState({
      vMint: dec.vMint,
      veMint: dec.veMint,
      veTotal: dec.veTotal,
      padding: dec.padding,
    });
  }

  toJSON(): StakingStateJSON {
    return {
      vMint: this.vMint.toString(),
      veMint: this.veMint.toString(),
      veTotal: this.veTotal.toString(),
      padding: this.padding,
    };
  }

  static fromJSON(obj: StakingStateJSON): StakingState {
    return new StakingState({
      vMint: new PublicKey(obj.vMint),
      veMint: new PublicKey(obj.veMint),
      veTotal: new BN(obj.veTotal),
      padding: obj.padding,
    });
  }
}
