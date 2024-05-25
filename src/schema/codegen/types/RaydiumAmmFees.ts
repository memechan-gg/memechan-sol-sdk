import { PublicKey } from "@solana/web3.js"; // eslint-disable-line @typescript-eslint/no-unused-vars
import BN from "bn.js"; // eslint-disable-line @typescript-eslint/no-unused-vars
import * as types from "../types"; // eslint-disable-line @typescript-eslint/no-unused-vars
import * as borsh from "@project-serum/borsh";

export interface RaydiumAmmFeesFields {
  lastCumQuoteFees: BN;
  lastCumMemeFees: BN;
}

export interface RaydiumAmmFeesJSON {
  lastCumQuoteFees: string;
  lastCumMemeFees: string;
}

export class RaydiumAmmFees {
  readonly lastCumQuoteFees: BN;
  readonly lastCumMemeFees: BN;

  constructor(fields: RaydiumAmmFeesFields) {
    this.lastCumQuoteFees = fields.lastCumQuoteFees;
    this.lastCumMemeFees = fields.lastCumMemeFees;
  }

  static layout(property?: string) {
    return borsh.struct([borsh.u64("lastCumQuoteFees"), borsh.u64("lastCumMemeFees")], property);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  static fromDecoded(obj: any) {
    return new RaydiumAmmFees({
      lastCumQuoteFees: obj.lastCumQuoteFees,
      lastCumMemeFees: obj.lastCumMemeFees,
    });
  }

  static toEncodable(fields: RaydiumAmmFeesFields) {
    return {
      lastCumQuoteFees: fields.lastCumQuoteFees,
      lastCumMemeFees: fields.lastCumMemeFees,
    };
  }

  toJSON(): RaydiumAmmFeesJSON {
    return {
      lastCumQuoteFees: this.lastCumQuoteFees.toString(),
      lastCumMemeFees: this.lastCumMemeFees.toString(),
    };
  }

  static fromJSON(obj: RaydiumAmmFeesJSON): RaydiumAmmFees {
    return new RaydiumAmmFees({
      lastCumQuoteFees: new BN(obj.lastCumQuoteFees),
      lastCumMemeFees: new BN(obj.lastCumMemeFees),
    });
  }

  toEncodable() {
    return RaydiumAmmFees.toEncodable(this);
  }
}
