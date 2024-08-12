import { TransactionInstruction, PublicKey } from "@solana/web3.js"; // eslint-disable-line @typescript-eslint/no-unused-vars
import BN from "bn.js"; // eslint-disable-line @typescript-eslint/no-unused-vars
import * as borsh from "@project-serum/borsh"; // eslint-disable-line @typescript-eslint/no-unused-vars
import * as types from "../types"; // eslint-disable-line @typescript-eslint/no-unused-vars
import { PROGRAM_ID } from "../programId";

export interface FixAdminTicketAccounts {
  sender: PublicKey;
  staking: PublicKey;
  adminTicket: PublicKey;
}

export function fixAdminTicket(accounts: FixAdminTicketAccounts) {
  const keys = [
    { pubkey: accounts.sender, isSigner: true, isWritable: true },
    { pubkey: accounts.staking, isSigner: false, isWritable: true },
    { pubkey: accounts.adminTicket, isSigner: false, isWritable: true },
  ];
  const identifier = Buffer.from([248, 184, 237, 201, 98, 173, 57, 48]);
  const data = identifier;
  const ix = new TransactionInstruction({ keys, programId: PROGRAM_ID, data });
  return ix;
}
