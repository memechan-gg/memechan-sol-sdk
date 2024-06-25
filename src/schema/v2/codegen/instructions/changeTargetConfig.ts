import { TransactionInstruction, PublicKey } from "@solana/web3.js";
import BN from "bn.js"; // eslint-disable-line @typescript-eslint/no-unused-vars
import * as borsh from "@project-serum/borsh"; // eslint-disable-line @typescript-eslint/no-unused-vars
import * as types from "../types"; // eslint-disable-line @typescript-eslint/no-unused-vars
import { PROGRAM_ID } from "../programId";

export interface ChangeTargetConfigArgs {
  targetAmount: BN;
}

export interface ChangeTargetConfigAccounts {
  sender: PublicKey;
  targetConfig: PublicKey;
}

export const layout = borsh.struct([borsh.u64("targetAmount")]);

export function changeTargetConfig(args: ChangeTargetConfigArgs, accounts: ChangeTargetConfigAccounts) {
  const keys = [
    { pubkey: accounts.sender, isSigner: true, isWritable: false },
    { pubkey: accounts.targetConfig, isSigner: false, isWritable: true },
  ];
  const identifier = Buffer.from([135, 112, 72, 45, 64, 62, 32, 111]);
  const buffer = Buffer.alloc(1000);
  const len = layout.encode(
    {
      targetAmount: args.targetAmount,
    },
    buffer,
  );
  const data = Buffer.concat([identifier, buffer]).slice(0, 8 + len);
  const ix = new TransactionInstruction({ keys, programId: PROGRAM_ID, data });
  return ix;
}
