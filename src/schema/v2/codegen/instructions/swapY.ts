import { TransactionInstruction, PublicKey } from "@solana/web3.js"; // eslint-disable-line @typescript-eslint/no-unused-vars
import BN from "bn.js"; // eslint-disable-line @typescript-eslint/no-unused-vars
import * as borsh from "@project-serum/borsh"; // eslint-disable-line @typescript-eslint/no-unused-vars
import * as types from "../types"; // eslint-disable-line @typescript-eslint/no-unused-vars
import { PROGRAM_ID } from "../programId";

export interface SwapYArgs {
  coinInAmount: BN;
  coinXMinValue: BN;
  ticketNumber: BN;
}

export interface SwapYAccounts {
  pool: PublicKey;
  quoteVault: PublicKey;
  userSol: PublicKey;
  memeTicket: PublicKey;
  userStats: PublicKey;
  owner: PublicKey;
  poolSignerPda: PublicKey;
  tokenProgram: PublicKey;
  systemProgram: PublicKey;
}

export const layout = borsh.struct([borsh.u64("coinInAmount"), borsh.u64("coinXMinValue"), borsh.u64("ticketNumber")]);

export function swapY(args: SwapYArgs, accounts: SwapYAccounts) {
  const keys = [
    { pubkey: accounts.pool, isSigner: false, isWritable: true },
    { pubkey: accounts.quoteVault, isSigner: false, isWritable: true },
    { pubkey: accounts.userSol, isSigner: false, isWritable: true },
    { pubkey: accounts.memeTicket, isSigner: false, isWritable: true },
    { pubkey: accounts.userStats, isSigner: false, isWritable: true },
    { pubkey: accounts.owner, isSigner: true, isWritable: true },
    { pubkey: accounts.poolSignerPda, isSigner: false, isWritable: false },
    { pubkey: accounts.tokenProgram, isSigner: false, isWritable: false },
    { pubkey: accounts.systemProgram, isSigner: false, isWritable: false },
  ];
  const identifier = Buffer.from([126, 208, 104, 214, 101, 217, 59, 65]);
  const buffer = Buffer.alloc(1000);
  const len = layout.encode(
    {
      coinInAmount: args.coinInAmount,
      coinXMinValue: args.coinXMinValue,
      ticketNumber: args.ticketNumber,
    },
    buffer,
  );
  const data = Buffer.concat([identifier, buffer]).slice(0, 8 + len);
  const ix = new TransactionInstruction({ keys, programId: PROGRAM_ID, data });
  return ix;
}
