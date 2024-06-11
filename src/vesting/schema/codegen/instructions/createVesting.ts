import { TransactionInstruction, PublicKey } from "@solana/web3.js"; // eslint-disable-line @typescript-eslint/no-unused-vars
import BN from "bn.js"; // eslint-disable-line @typescript-eslint/no-unused-vars
import * as borsh from "@project-serum/borsh"; // eslint-disable-line @typescript-eslint/no-unused-vars
import { PROGRAM_ID } from "../programId";

export interface CreateVestingArgs {
  vestingNumber: BN;
  depositAmount: BN;
  startTs: BN;
  endTs: BN;
  periodCount: BN;
}

export interface CreateVestingAccounts {
  vesting: PublicKey;
  vestingSigner: PublicKey;
  vault: PublicKey;
  beneficiary: PublicKey;
  depositorTokenAccount: PublicKey;
  depositorAuthority: PublicKey;
  tokenProgram: PublicKey;
  systemProgram: PublicKey;
}

export const layout = borsh.struct([
  borsh.u64("vestingNumber"),
  borsh.u64("depositAmount"),
  borsh.i64("startTs"),
  borsh.i64("endTs"),
  borsh.u64("periodCount"),
]);

export function createVesting(args: CreateVestingArgs, accounts: CreateVestingAccounts) {
  const keys = [
    { pubkey: accounts.vesting, isSigner: false, isWritable: true },
    { pubkey: accounts.vestingSigner, isSigner: false, isWritable: false },
    { pubkey: accounts.vault, isSigner: false, isWritable: true },
    { pubkey: accounts.beneficiary, isSigner: false, isWritable: false },
    {
      pubkey: accounts.depositorTokenAccount,
      isSigner: false,
      isWritable: true,
    },
    { pubkey: accounts.depositorAuthority, isSigner: true, isWritable: true },
    { pubkey: accounts.tokenProgram, isSigner: false, isWritable: false },
    { pubkey: accounts.systemProgram, isSigner: false, isWritable: false },
  ];
  const identifier = Buffer.from([135, 184, 171, 156, 197, 162, 246, 44]);
  const buffer = Buffer.alloc(1000);
  const len = layout.encode(
    {
      vestingNumber: args.vestingNumber,
      depositAmount: args.depositAmount,
      startTs: args.startTs,
      endTs: args.endTs,
      periodCount: args.periodCount,
    },
    buffer,
  );
  const data = Buffer.concat([identifier, buffer]).slice(0, 8 + len);
  const ix = new TransactionInstruction({ keys, programId: PROGRAM_ID, data });
  return ix;
}
