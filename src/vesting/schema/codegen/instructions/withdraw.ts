import { TransactionInstruction, PublicKey } from "@solana/web3.js"; // eslint-disable-line @typescript-eslint/no-unused-vars
import BN from "bn.js"; // eslint-disable-line @typescript-eslint/no-unused-vars
import * as borsh from "@project-serum/borsh"; // eslint-disable-line @typescript-eslint/no-unused-vars
import { PROGRAM_ID } from "../programId";

export interface WithdrawArgs {
  amount: BN;
}

export interface WithdrawAccounts {
  vesting: PublicKey;
  beneficiary: PublicKey;
  vault: PublicKey;
  vestingSigner: PublicKey;
  userTokenAccount: PublicKey;
  tokenProgram: PublicKey;
}

export const layout = borsh.struct([borsh.u64("amount")]);

export function withdraw(args: WithdrawArgs, accounts: WithdrawAccounts) {
  const keys = [
    { pubkey: accounts.vesting, isSigner: false, isWritable: true },
    { pubkey: accounts.beneficiary, isSigner: true, isWritable: false },
    { pubkey: accounts.vault, isSigner: false, isWritable: true },
    { pubkey: accounts.vestingSigner, isSigner: false, isWritable: false },
    { pubkey: accounts.userTokenAccount, isSigner: false, isWritable: true },
    { pubkey: accounts.tokenProgram, isSigner: false, isWritable: false },
  ];
  const identifier = Buffer.from([183, 18, 70, 156, 148, 109, 161, 34]);
  const buffer = Buffer.alloc(1000);
  const len = layout.encode(
    {
      amount: args.amount,
    },
    buffer,
  );
  const data = Buffer.concat([identifier, buffer]).slice(0, 8 + len);
  const ix = new TransactionInstruction({ keys, programId: PROGRAM_ID, data });
  return ix;
}
