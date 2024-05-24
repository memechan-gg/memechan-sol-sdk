import { PublicKey, Connection } from "@solana/web3.js";
import BN from "bn.js"; // eslint-disable-line @typescript-eslint/no-unused-vars
import * as borsh from "@project-serum/borsh"; // eslint-disable-line @typescript-eslint/no-unused-vars
import * as types from "../types"; // eslint-disable-line @typescript-eslint/no-unused-vars
import { PROGRAM_ID } from "../programId";

export interface TargetConfigFields {
  tokenTargetAmount: BN;
  tokenMint: PublicKey;
}

export interface TargetConfigJSON {
  tokenTargetAmount: string;
  tokenMint: string;
}

export class TargetConfig {
  readonly tokenTargetAmount: BN;
  readonly tokenMint: PublicKey;

  static readonly discriminator = Buffer.from([83, 195, 212, 193, 86, 39, 66, 235]);

  static readonly layout = borsh.struct([borsh.u64("tokenTargetAmount"), borsh.publicKey("tokenMint")]);

  constructor(fields: TargetConfigFields) {
    this.tokenTargetAmount = fields.tokenTargetAmount;
    this.tokenMint = fields.tokenMint;
  }

  static async fetch(c: Connection, address: PublicKey): Promise<TargetConfig | null> {
    const info = await c.getAccountInfo(address);

    if (info === null) {
      return null;
    }
    if (!info.owner.equals(PROGRAM_ID)) {
      throw new Error("account doesn't belong to this program");
    }

    return this.decode(info.data);
  }

  static async fetchMultiple(c: Connection, addresses: PublicKey[]): Promise<Array<TargetConfig | null>> {
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

  static decode(data: Buffer): TargetConfig {
    if (!data.slice(0, 8).equals(TargetConfig.discriminator)) {
      throw new Error("invalid account discriminator");
    }

    const dec = TargetConfig.layout.decode(data.slice(8));

    return new TargetConfig({
      tokenTargetAmount: dec.tokenTargetAmount,
      tokenMint: dec.tokenMint,
    });
  }

  toJSON(): TargetConfigJSON {
    return {
      tokenTargetAmount: this.tokenTargetAmount.toString(),
      tokenMint: this.tokenMint.toString(),
    };
  }

  static fromJSON(obj: TargetConfigJSON): TargetConfig {
    return new TargetConfig({
      tokenTargetAmount: new BN(obj.tokenTargetAmount),
      tokenMint: new PublicKey(obj.tokenMint),
    });
  }
}
