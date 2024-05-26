import { PublicKey, Connection } from "@solana/web3.js";
import BN from "bn.js"; // eslint-disable-line @typescript-eslint/no-unused-vars
import * as borsh from "@project-serum/borsh"; // eslint-disable-line @typescript-eslint/no-unused-vars
import * as types from "../types"; // eslint-disable-line @typescript-eslint/no-unused-vars
import { PROGRAM_ID } from "../programId";

export interface StakingPoolFields {
  pool: PublicKey;
  memeVault: PublicKey;
  memeMint: PublicKey;
  lpVault: PublicKey;
  lpMint: PublicKey;
  quoteVault: PublicKey;
  vestingConfig: types.VestingConfigFields;
  raydiumFees: types.RaydiumAmmFeesFields;
  stakesTotal: BN;
  feesXTotal: BN;
  feesYTotal: BN;
}

export interface StakingPoolJSON {
  pool: string;
  memeVault: string;
  memeMint: string;
  lpVault: string;
  lpMint: string;
  quoteVault: string;
  vestingConfig: types.VestingConfigJSON;
  raydiumFees: types.RaydiumAmmFeesJSON;
  stakesTotal: string;
  feesXTotal: string;
  feesYTotal: string;
}

export class StakingPool {
  readonly pool: PublicKey;
  readonly memeVault: PublicKey;
  readonly memeMint: PublicKey;
  readonly lpVault: PublicKey;
  readonly lpMint: PublicKey;
  readonly quoteVault: PublicKey;
  readonly vestingConfig: types.VestingConfig;
  readonly raydiumFees: types.RaydiumAmmFees;
  readonly stakesTotal: BN;
  readonly feesXTotal: BN;
  readonly feesYTotal: BN;

  static readonly discriminator = Buffer.from([203, 19, 214, 220, 220, 154, 24, 102]);

  static readonly layout = borsh.struct([
    borsh.publicKey("pool"),
    borsh.publicKey("memeVault"),
    borsh.publicKey("memeMint"),
    borsh.publicKey("lpVault"),
    borsh.publicKey("lpMint"),
    borsh.publicKey("quoteVault"),
    types.VestingConfig.layout("vestingConfig"),
    types.RaydiumAmmFees.layout("raydiumFees"),
    borsh.u64("stakesTotal"),
    borsh.u64("feesXTotal"),
    borsh.u64("feesYTotal"),
  ]);

  constructor(fields: StakingPoolFields) {
    this.pool = fields.pool;
    this.memeVault = fields.memeVault;
    this.memeMint = fields.memeMint;
    this.lpVault = fields.lpVault;
    this.lpMint = fields.lpMint;
    this.quoteVault = fields.quoteVault;
    this.vestingConfig = new types.VestingConfig({ ...fields.vestingConfig });
    this.raydiumFees = new types.RaydiumAmmFees({ ...fields.raydiumFees });
    this.stakesTotal = fields.stakesTotal;
    this.feesXTotal = fields.feesXTotal;
    this.feesYTotal = fields.feesYTotal;
  }

  static async fetch(c: Connection, address: PublicKey): Promise<StakingPool | null> {
    const info = await c.getAccountInfo(address);

    if (info === null) {
      return null;
    }
    if (!info.owner.equals(PROGRAM_ID)) {
      throw new Error("account doesn't belong to this program");
    }

    return this.decode(info.data);
  }

  static async fetchMultiple(c: Connection, addresses: PublicKey[]): Promise<Array<StakingPool | null>> {
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

  static decode(data: Buffer): StakingPool {
    if (!data.slice(0, 8).equals(StakingPool.discriminator)) {
      throw new Error("invalid account discriminator");
    }

    const dec = StakingPool.layout.decode(data.slice(8));

    return new StakingPool({
      pool: dec.pool,
      memeVault: dec.memeVault,
      memeMint: dec.memeMint,
      lpVault: dec.lpVault,
      lpMint: dec.lpMint,
      quoteVault: dec.quoteVault,
      vestingConfig: types.VestingConfig.fromDecoded(dec.vestingConfig),
      raydiumFees: types.RaydiumAmmFees.fromDecoded(dec.raydiumFees),
      stakesTotal: dec.stakesTotal,
      feesXTotal: dec.feesXTotal,
      feesYTotal: dec.feesYTotal,
    });
  }

  toJSON(): StakingPoolJSON {
    return {
      pool: this.pool.toString(),
      memeVault: this.memeVault.toString(),
      memeMint: this.memeMint.toString(),
      lpVault: this.lpVault.toString(),
      lpMint: this.lpMint.toString(),
      quoteVault: this.quoteVault.toString(),
      vestingConfig: this.vestingConfig.toJSON(),
      raydiumFees: this.raydiumFees.toJSON(),
      stakesTotal: this.stakesTotal.toString(),
      feesXTotal: this.feesXTotal.toString(),
      feesYTotal: this.feesYTotal.toString(),
    };
  }

  static fromJSON(obj: StakingPoolJSON): StakingPool {
    return new StakingPool({
      pool: new PublicKey(obj.pool),
      memeVault: new PublicKey(obj.memeVault),
      memeMint: new PublicKey(obj.memeMint),
      lpVault: new PublicKey(obj.lpVault),
      lpMint: new PublicKey(obj.lpMint),
      quoteVault: new PublicKey(obj.quoteVault),
      vestingConfig: types.VestingConfig.fromJSON(obj.vestingConfig),
      raydiumFees: types.RaydiumAmmFees.fromJSON(obj.raydiumFees),
      stakesTotal: new BN(obj.stakesTotal),
      feesXTotal: new BN(obj.feesXTotal),
      feesYTotal: new BN(obj.feesYTotal),
    });
  }
}
