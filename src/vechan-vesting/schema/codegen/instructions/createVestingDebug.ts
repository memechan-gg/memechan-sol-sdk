import { TransactionInstruction, PublicKey } from "@solana/web3.js"; // eslint-disable-line @typescript-eslint/no-unused-vars
import BN from "bn.js"; // eslint-disable-line @typescript-eslint/no-unused-vars
import * as borsh from "@project-serum/borsh"; // eslint-disable-line @typescript-eslint/no-unused-vars
import { PROGRAM_ID } from "../programId";

export interface CreateVestingDebugArgs {
  tokenAmt: BN;
}

export interface CreateVestingDebugAccounts {
  signer: PublicKey;
  beneficiary: PublicKey;
  vesting: PublicKey;
  vestingSigner: PublicKey;
  vault: PublicKey;
  mint: PublicKey;
  vMint: PublicKey;
  systemProgram: PublicKey;
}

export const layout = borsh.struct([borsh.u64("tokenAmt")]);

export function createVestingDebug(args: CreateVestingDebugArgs, accounts: CreateVestingDebugAccounts) {
  const keys = [
    { pubkey: accounts.signer, isSigner: true, isWritable: true },
    { pubkey: accounts.beneficiary, isSigner: false, isWritable: false },
    { pubkey: accounts.vesting, isSigner: false, isWritable: true },
    { pubkey: accounts.vestingSigner, isSigner: false, isWritable: false },
    { pubkey: accounts.vault, isSigner: false, isWritable: true },
    { pubkey: accounts.mint, isSigner: false, isWritable: false },
    { pubkey: accounts.vMint, isSigner: false, isWritable: false },
    { pubkey: accounts.systemProgram, isSigner: false, isWritable: false },
  ];
  const identifier = Buffer.from([211, 8, 225, 208, 7, 216, 20, 96]);
  const buffer = Buffer.alloc(1000);
  const len = layout.encode(
    {
      tokenAmt: args.tokenAmt,
    },
    buffer,
  );
  const data = Buffer.concat([identifier, buffer]).slice(0, 8 + len);
  const ix = new TransactionInstruction({ keys, programId: PROGRAM_ID, data });
  return ix;
}
