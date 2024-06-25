import { TransactionInstruction, PublicKey } from "@solana/web3.js";
import BN from "bn.js"; // eslint-disable-line @typescript-eslint/no-unused-vars
import * as borsh from "@project-serum/borsh"; // eslint-disable-line @typescript-eslint/no-unused-vars
import * as types from "../types"; // eslint-disable-line @typescript-eslint/no-unused-vars
import { PROGRAM_ID } from "../programId";

export interface SwapXArgs {
  coinInAmount: BN;
  coinYMinValue: BN;
}

export interface SwapXAccounts {
  pool: PublicKey;
  memeTicket: PublicKey;
  userSol: PublicKey;
  quoteVault: PublicKey;
  owner: PublicKey;
  poolSigner: PublicKey;
  tokenProgram: PublicKey;
}

export const layout = borsh.struct([borsh.u64("coinInAmount"), borsh.u64("coinYMinValue")]);

export function swapX(args: SwapXArgs, accounts: SwapXAccounts) {
  const keys = [
    { pubkey: accounts.pool, isSigner: false, isWritable: true },
    { pubkey: accounts.memeTicket, isSigner: false, isWritable: true },
    { pubkey: accounts.userSol, isSigner: false, isWritable: true },
    { pubkey: accounts.quoteVault, isSigner: false, isWritable: true },
    { pubkey: accounts.owner, isSigner: true, isWritable: false },
    { pubkey: accounts.poolSigner, isSigner: false, isWritable: false },
    { pubkey: accounts.tokenProgram, isSigner: false, isWritable: false },
  ];
  const identifier = Buffer.from([65, 63, 86, 168, 233, 191, 123, 134]);
  const buffer = Buffer.alloc(1000);
  const len = layout.encode(
    {
      coinInAmount: args.coinInAmount,
      coinYMinValue: args.coinYMinValue,
    },
    buffer,
  );
  const data = Buffer.concat([identifier, buffer]).slice(0, 8 + len);
  const ix = new TransactionInstruction({ keys, programId: PROGRAM_ID, data });
  return ix;
}
