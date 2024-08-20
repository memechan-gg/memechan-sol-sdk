import { PublicKey, Connection } from "@solana/web3.js";
import BN from "bn.js"; // eslint-disable-line @typescript-eslint/no-unused-vars
import * as borsh from "@project-serum/borsh"; // eslint-disable-line @typescript-eslint/no-unused-vars
import { PROGRAM_ID } from "../programId";

export interface UserStakeFields {
  owner: PublicKey;
  mint: PublicKey;
  vault: PublicKey;
  stakingState: PublicKey;
  amount: BN;
  veAmount: BN;
  stakedAt: BN;
  lockedUntilTs: BN;
  withdrawnAt: BN;
  padding: Array<number>;
}

export interface UserStakeJSON {
  owner: string;
  mint: string;
  vault: string;
  stakingState: string;
  amount: string;
  veAmount: string;
  stakedAt: string;
  lockedUntilTs: string;
  withdrawnAt: string;
  padding: Array<number>;
}

export class UserStake {
  readonly owner: PublicKey;
  readonly mint: PublicKey;
  readonly vault: PublicKey;
  readonly stakingState: PublicKey;
  readonly amount: BN;
  readonly veAmount: BN;
  readonly stakedAt: BN;
  readonly lockedUntilTs: BN;
  readonly withdrawnAt: BN;
  readonly padding: Array<number>;

  static readonly discriminator = Buffer.from([102, 53, 163, 107, 9, 138, 87, 153]);

  static readonly layout = borsh.struct([
    borsh.publicKey("owner"),
    borsh.publicKey("mint"),
    borsh.publicKey("vault"),
    borsh.publicKey("stakingState"),
    borsh.u64("amount"),
    borsh.u64("veAmount"),
    borsh.i64("stakedAt"),
    borsh.i64("lockedUntilTs"),
    borsh.i64("withdrawnAt"),
    borsh.array(borsh.u8(), 8, "padding"),
  ]);

  constructor(fields: UserStakeFields) {
    this.owner = fields.owner;
    this.mint = fields.mint;
    this.vault = fields.vault;
    this.stakingState = fields.stakingState;
    this.amount = fields.amount;
    this.veAmount = fields.veAmount;
    this.stakedAt = fields.stakedAt;
    this.lockedUntilTs = fields.lockedUntilTs;
    this.withdrawnAt = fields.withdrawnAt;
    this.padding = fields.padding;
  }

  static async fetch(c: Connection, address: PublicKey): Promise<UserStake | null> {
    const info = await c.getAccountInfo(address);

    if (info === null) {
      return null;
    }
    if (!info.owner.equals(PROGRAM_ID)) {
      throw new Error("account doesn't belong to this program");
    }

    return this.decode(info.data);
  }

  static async fetchMultiple(c: Connection, addresses: PublicKey[]): Promise<Array<UserStake | null>> {
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

  static decode(data: Buffer): UserStake {
    if (!data.slice(0, 8).equals(UserStake.discriminator)) {
      throw new Error("invalid account discriminator");
    }

    const dec = UserStake.layout.decode(data.slice(8));

    return new UserStake({
      owner: dec.owner,
      mint: dec.mint,
      vault: dec.vault,
      stakingState: dec.stakingState,
      amount: dec.amount,
      veAmount: dec.veAmount,
      stakedAt: dec.stakedAt,
      lockedUntilTs: dec.lockedUntilTs,
      withdrawnAt: dec.withdrawnAt,
      padding: dec.padding,
    });
  }

  toJSON(): UserStakeJSON {
    return {
      owner: this.owner.toString(),
      mint: this.mint.toString(),
      vault: this.vault.toString(),
      stakingState: this.stakingState.toString(),
      amount: this.amount.toString(),
      veAmount: this.veAmount.toString(),
      stakedAt: this.stakedAt.toString(),
      lockedUntilTs: this.lockedUntilTs.toString(),
      withdrawnAt: this.withdrawnAt.toString(),
      padding: this.padding,
    };
  }

  static fromJSON(obj: UserStakeJSON): UserStake {
    return new UserStake({
      owner: new PublicKey(obj.owner),
      mint: new PublicKey(obj.mint),
      vault: new PublicKey(obj.vault),
      stakingState: new PublicKey(obj.stakingState),
      amount: new BN(obj.amount),
      veAmount: new BN(obj.veAmount),
      stakedAt: new BN(obj.stakedAt),
      lockedUntilTs: new BN(obj.lockedUntilTs),
      withdrawnAt: new BN(obj.withdrawnAt),
      padding: obj.padding,
    });
  }
}
