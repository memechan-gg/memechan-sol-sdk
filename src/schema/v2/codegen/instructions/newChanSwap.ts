import { TransactionInstruction, PublicKey } from "@solana/web3.js";
import BN from "bn.js"; // eslint-disable-line @typescript-eslint/no-unused-vars
import * as borsh from "@project-serum/borsh"; // eslint-disable-line @typescript-eslint/no-unused-vars
import * as types from "../types"; // eslint-disable-line @typescript-eslint/no-unused-vars
import { PROGRAM_ID } from "../programId";

export interface NewChanSwapArgs {
  newPriceNum: BN;
  newPriceDenom: BN;
}

export interface NewChanSwapAccounts {
  sender: PublicKey;
  chanSwap: PublicKey;
  chanSwapSignerPda: PublicKey;
  chanVault: PublicKey;
  systemProgram: PublicKey;
}

export const layout = borsh.struct([borsh.u64("newPriceNum"), borsh.u64("newPriceDenom")]);

export function newChanSwap(args: NewChanSwapArgs, accounts: NewChanSwapAccounts) {
  const keys = [
    { pubkey: accounts.sender, isSigner: true, isWritable: true },
    { pubkey: accounts.chanSwap, isSigner: false, isWritable: true },
    { pubkey: accounts.chanSwapSignerPda, isSigner: false, isWritable: false },
    { pubkey: accounts.chanVault, isSigner: false, isWritable: true },
    { pubkey: accounts.systemProgram, isSigner: false, isWritable: false },
  ];
  const identifier = Buffer.from([80, 132, 251, 120, 200, 27, 13, 95]);
  const buffer = Buffer.alloc(1000);
  const len = layout.encode(
    {
      newPriceNum: args.newPriceNum,
      newPriceDenom: args.newPriceDenom,
    },
    buffer,
  );
  const data = Buffer.concat([identifier, buffer]).slice(0, 8 + len);
  const ix = new TransactionInstruction({ keys, programId: PROGRAM_ID, data });
  return ix;
}
