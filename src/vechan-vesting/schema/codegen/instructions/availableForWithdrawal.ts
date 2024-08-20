import { TransactionInstruction, PublicKey } from "@solana/web3.js"; // eslint-disable-line @typescript-eslint/no-unused-vars
import BN from "bn.js"; // eslint-disable-line @typescript-eslint/no-unused-vars
import * as borsh from "@project-serum/borsh"; // eslint-disable-line @typescript-eslint/no-unused-vars
import { PROGRAM_ID } from "../programId";

export interface AvailableForWithdrawalAccounts {
  vesting: PublicKey;
}

export function availableForWithdrawal(accounts: AvailableForWithdrawalAccounts) {
  const keys = [{ pubkey: accounts.vesting, isSigner: false, isWritable: false }];
  const identifier = Buffer.from([176, 181, 67, 9, 120, 172, 226, 206]);
  const data = identifier;
  const ix = new TransactionInstruction({ keys, programId: PROGRAM_ID, data });
  return ix;
}
