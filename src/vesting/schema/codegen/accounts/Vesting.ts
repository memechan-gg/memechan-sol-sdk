import { PublicKey, Connection } from "@solana/web3.js";
import BN from "bn.js"; // eslint-disable-line @typescript-eslint/no-unused-vars
import * as borsh from "@project-serum/borsh"; // eslint-disable-line @typescript-eslint/no-unused-vars
import { PROGRAM_ID } from "../programId";

export interface VestingFields {
  beneficiary: PublicKey;
  mint: PublicKey;
  vault: PublicKey;
  grantor: PublicKey;
  outstanding: BN;
  startBalance: BN;
  createdTs: BN;
  startTs: BN;
  endTs: BN;
  periodCount: BN;
  whitelistOwned: BN;
  nonce: number;
}

export interface VestingJSON {
  beneficiary: string;
  mint: string;
  vault: string;
  grantor: string;
  outstanding: string;
  startBalance: string;
  createdTs: string;
  startTs: string;
  endTs: string;
  periodCount: string;
  whitelistOwned: string;
  nonce: number;
}

export class Vesting {
  readonly beneficiary: PublicKey;
  readonly mint: PublicKey;
  readonly vault: PublicKey;
  readonly grantor: PublicKey;
  readonly outstanding: BN;
  readonly startBalance: BN;
  readonly createdTs: BN;
  readonly startTs: BN;
  readonly endTs: BN;
  readonly periodCount: BN;
  readonly whitelistOwned: BN;
  readonly nonce: number;

  static readonly discriminator = Buffer.from([100, 149, 66, 138, 95, 200, 128, 241]);

  static readonly layout = borsh.struct([
    borsh.publicKey("beneficiary"),
    borsh.publicKey("mint"),
    borsh.publicKey("vault"),
    borsh.publicKey("grantor"),
    borsh.u64("outstanding"),
    borsh.u64("startBalance"),
    borsh.i64("createdTs"),
    borsh.i64("startTs"),
    borsh.i64("endTs"),
    borsh.u64("periodCount"),
    borsh.u64("whitelistOwned"),
    borsh.u8("nonce"),
  ]);

  constructor(fields: VestingFields) {
    this.beneficiary = fields.beneficiary;
    this.mint = fields.mint;
    this.vault = fields.vault;
    this.grantor = fields.grantor;
    this.outstanding = fields.outstanding;
    this.startBalance = fields.startBalance;
    this.createdTs = fields.createdTs;
    this.startTs = fields.startTs;
    this.endTs = fields.endTs;
    this.periodCount = fields.periodCount;
    this.whitelistOwned = fields.whitelistOwned;
    this.nonce = fields.nonce;
  }

  static async fetch(c: Connection, address: PublicKey): Promise<Vesting | null> {
    const info = await c.getAccountInfo(address);

    if (info === null) {
      return null;
    }
    if (!info.owner.equals(PROGRAM_ID)) {
      throw new Error("account doesn't belong to this program");
    }

    return this.decode(info.data);
  }

  static async fetchMultiple(c: Connection, addresses: PublicKey[]): Promise<Array<Vesting | null>> {
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

  static decode(data: Buffer): Vesting {
    if (!data.slice(0, 8).equals(Vesting.discriminator)) {
      throw new Error("invalid account discriminator");
    }

    const dec = Vesting.layout.decode(data.slice(8));

    return new Vesting({
      beneficiary: dec.beneficiary,
      mint: dec.mint,
      vault: dec.vault,
      grantor: dec.grantor,
      outstanding: dec.outstanding,
      startBalance: dec.startBalance,
      createdTs: dec.createdTs,
      startTs: dec.startTs,
      endTs: dec.endTs,
      periodCount: dec.periodCount,
      whitelistOwned: dec.whitelistOwned,
      nonce: dec.nonce,
    });
  }

  toJSON(): VestingJSON {
    return {
      beneficiary: this.beneficiary.toString(),
      mint: this.mint.toString(),
      vault: this.vault.toString(),
      grantor: this.grantor.toString(),
      outstanding: this.outstanding.toString(),
      startBalance: this.startBalance.toString(),
      createdTs: this.createdTs.toString(),
      startTs: this.startTs.toString(),
      endTs: this.endTs.toString(),
      periodCount: this.periodCount.toString(),
      whitelistOwned: this.whitelistOwned.toString(),
      nonce: this.nonce,
    };
  }

  static fromJSON(obj: VestingJSON): Vesting {
    return new Vesting({
      beneficiary: new PublicKey(obj.beneficiary),
      mint: new PublicKey(obj.mint),
      vault: new PublicKey(obj.vault),
      grantor: new PublicKey(obj.grantor),
      outstanding: new BN(obj.outstanding),
      startBalance: new BN(obj.startBalance),
      createdTs: new BN(obj.createdTs),
      startTs: new BN(obj.startTs),
      endTs: new BN(obj.endTs),
      periodCount: new BN(obj.periodCount),
      whitelistOwned: new BN(obj.whitelistOwned),
      nonce: obj.nonce,
    });
  }
}
