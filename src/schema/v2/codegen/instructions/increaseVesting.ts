import { TransactionInstruction, PublicKey } from "@solana/web3.js";
import BN from "bn.js"; // eslint-disable-line @typescript-eslint/no-unused-vars
import * as borsh from "@project-serum/borsh"; // eslint-disable-line @typescript-eslint/no-unused-vars
import * as types from "../types"; // eslint-disable-line @typescript-eslint/no-unused-vars
import { PROGRAM_ID } from "../programId";

export interface IncreaseVestingArgs {
  vestingTsIncrease: BN;
}

export interface IncreaseVestingAccounts {
  sender: PublicKey;
  staking: PublicKey;
}

export const layout = borsh.struct([borsh.u64("vestingTsIncrease")]);

export function increaseVesting(args: IncreaseVestingArgs, accounts: IncreaseVestingAccounts) {
  const keys = [
    { pubkey: accounts.sender, isSigner: true, isWritable: false },
    { pubkey: accounts.staking, isSigner: false, isWritable: true },
  ];
  const identifier = Buffer.from([126, 98, 71, 235, 153, 68, 219, 200]);
  const buffer = Buffer.alloc(1000);
  const len = layout.encode(
    {
      vestingTsIncrease: args.vestingTsIncrease,
    },
    buffer,
  );
  const data = Buffer.concat([identifier, buffer]).slice(0, 8 + len);
  const ix = new TransactionInstruction({ keys, programId: PROGRAM_ID, data });
  return ix;
}
