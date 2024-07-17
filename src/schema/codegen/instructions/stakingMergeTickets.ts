import { TransactionInstruction, PublicKey } from "@solana/web3.js"; // eslint-disable-line @typescript-eslint/no-unused-vars
import BN from "bn.js"; // eslint-disable-line @typescript-eslint/no-unused-vars
import * as borsh from "@project-serum/borsh"; // eslint-disable-line @typescript-eslint/no-unused-vars
import * as types from "../types"; // eslint-disable-line @typescript-eslint/no-unused-vars
import { PROGRAM_ID } from "../programId";

export interface StakingMergeTicketsAccounts {
  staking: PublicKey;
  ticketInto: PublicKey;
  ticketFrom: PublicKey;
  owner: PublicKey;
}

export function stakingMergeTickets(accounts: StakingMergeTicketsAccounts) {
  const keys = [
    { pubkey: accounts.staking, isSigner: false, isWritable: false },
    { pubkey: accounts.ticketInto, isSigner: false, isWritable: true },
    { pubkey: accounts.ticketFrom, isSigner: false, isWritable: true },
    { pubkey: accounts.owner, isSigner: true, isWritable: true },
  ];
  const identifier = Buffer.from([137, 245, 227, 85, 194, 243, 0, 224]);
  const data = identifier;
  const ix = new TransactionInstruction({ keys, programId: PROGRAM_ID, data });
  return ix;
}
