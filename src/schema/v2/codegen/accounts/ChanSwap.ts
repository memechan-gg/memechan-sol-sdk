import { PublicKey, Connection } from "@solana/web3.js";
import BN from "bn.js"; // eslint-disable-line @typescript-eslint/no-unused-vars
import * as borsh from "@project-serum/borsh"; // eslint-disable-line @typescript-eslint/no-unused-vars
import * as types from "../types"; // eslint-disable-line @typescript-eslint/no-unused-vars
import { PROGRAM_ID } from "../programId";

export interface ChanSwapFields {
  chanSolPriceNum: BN;
  chanSolPriceDenom: BN;
  chanVault: PublicKey;
}

export interface ChanSwapJSON {
  chanSolPriceNum: string;
  chanSolPriceDenom: string;
  chanVault: string;
}

export class ChanSwap {
  readonly chanSolPriceNum: BN;
  readonly chanSolPriceDenom: BN;
  readonly chanVault: PublicKey;

  static readonly discriminator = Buffer.from([213, 229, 222, 123, 234, 1, 225, 255]);

  static readonly layout = borsh.struct([
    borsh.u64("chanSolPriceNum"),
    borsh.u64("chanSolPriceDenom"),
    borsh.publicKey("chanVault"),
  ]);

  constructor(fields: ChanSwapFields) {
    this.chanSolPriceNum = fields.chanSolPriceNum;
    this.chanSolPriceDenom = fields.chanSolPriceDenom;
    this.chanVault = fields.chanVault;
  }

  static async fetch(c: Connection, address: PublicKey): Promise<ChanSwap | null> {
    const info = await c.getAccountInfo(address);

    if (info === null) {
      return null;
    }
    if (!info.owner.equals(PROGRAM_ID)) {
      throw new Error("account doesn't belong to this program");
    }

    return this.decode(info.data);
  }

  static async fetchMultiple(c: Connection, addresses: PublicKey[]): Promise<Array<ChanSwap | null>> {
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

  static decode(data: Buffer): ChanSwap {
    if (!data.slice(0, 8).equals(ChanSwap.discriminator)) {
      throw new Error("invalid account discriminator");
    }

    const dec = ChanSwap.layout.decode(data.slice(8));

    return new ChanSwap({
      chanSolPriceNum: dec.chanSolPriceNum,
      chanSolPriceDenom: dec.chanSolPriceDenom,
      chanVault: dec.chanVault,
    });
  }

  toJSON(): ChanSwapJSON {
    return {
      chanSolPriceNum: this.chanSolPriceNum.toString(),
      chanSolPriceDenom: this.chanSolPriceDenom.toString(),
      chanVault: this.chanVault.toString(),
    };
  }

  static fromJSON(obj: ChanSwapJSON): ChanSwap {
    return new ChanSwap({
      chanSolPriceNum: new BN(obj.chanSolPriceNum),
      chanSolPriceDenom: new BN(obj.chanSolPriceDenom),
      chanVault: new PublicKey(obj.chanVault),
    });
  }
}
