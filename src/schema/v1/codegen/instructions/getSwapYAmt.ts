import { TransactionInstruction, PublicKey } from "@solana/web3.js"; // eslint-disable-line @typescript-eslint/no-unused-vars
import BN from "bn.js"; // eslint-disable-line @typescript-eslint/no-unused-vars
import * as borsh from "@project-serum/borsh"; // eslint-disable-line @typescript-eslint/no-unused-vars
import * as types from "../types"; // eslint-disable-line @typescript-eslint/no-unused-vars
import { PROGRAM_ID } from "../programId";

export interface GetSwapYAmtArgs {
  coinInAmount: BN;
  coinXMinValue: BN;
}

export interface GetSwapYAmtAccounts {
  pool: PublicKey;
  quoteVault: PublicKey;
}

export const layout = borsh.struct([borsh.u64("coinInAmount"), borsh.u64("coinXMinValue")]);

export function getSwapYAmt(args: GetSwapYAmtArgs, accounts: GetSwapYAmtAccounts) {
  const keys = [
    { pubkey: accounts.pool, isSigner: false, isWritable: false },
    { pubkey: accounts.quoteVault, isSigner: false, isWritable: false },
  ];
  const identifier = Buffer.from([81, 86, 3, 150, 71, 68, 65, 241]);
  const buffer = Buffer.alloc(1000);
  const len = layout.encode(
    {
      coinInAmount: args.coinInAmount,
      coinXMinValue: args.coinXMinValue,
    },
    buffer,
  );
  const data = Buffer.concat([identifier, buffer]).slice(0, 8 + len);
  const ix = new TransactionInstruction({ keys, programId: PROGRAM_ID, data });
  return ix;
}
