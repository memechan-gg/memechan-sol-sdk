import { TransactionInstruction, PublicKey } from "@solana/web3.js";
import BN from "bn.js"; // eslint-disable-line @typescript-eslint/no-unused-vars
import * as borsh from "@project-serum/borsh"; // eslint-disable-line @typescript-eslint/no-unused-vars
import * as types from "../types"; // eslint-disable-line @typescript-eslint/no-unused-vars
import { PROGRAM_ID } from "../programId";

export interface ChangeChanPriceArgs {
  newPriceNum: BN;
  newPriceDenom: BN;
}

export interface ChangeChanPriceAccounts {
  sender: PublicKey;
  chanSwap: PublicKey;
}

export const layout = borsh.struct([borsh.u64("newPriceNum"), borsh.u64("newPriceDenom")]);

export function changeChanPrice(args: ChangeChanPriceArgs, accounts: ChangeChanPriceAccounts) {
  const keys = [
    { pubkey: accounts.sender, isSigner: true, isWritable: false },
    { pubkey: accounts.chanSwap, isSigner: false, isWritable: true },
  ];
  const identifier = Buffer.from([28, 194, 14, 108, 113, 215, 47, 59]);
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
