import { TransactionInstruction, PublicKey } from "@solana/web3.js"; // eslint-disable-line @typescript-eslint/no-unused-vars
import BN from "bn.js"; // eslint-disable-line @typescript-eslint/no-unused-vars
import * as borsh from "@project-serum/borsh"; // eslint-disable-line @typescript-eslint/no-unused-vars
import { PROGRAM_ID } from "../programId";

export interface CreateStakingStateAccounts {
  signer: PublicKey;
  stakingState: PublicKey;
  vMint: PublicKey;
  veMint: PublicKey;
  tokenProgram: PublicKey;
  token2022: PublicKey;
  systemProgram: PublicKey;
}

export function createStakingState(accounts: CreateStakingStateAccounts) {
  const keys = [
    { pubkey: accounts.signer, isSigner: true, isWritable: true },
    { pubkey: accounts.stakingState, isSigner: false, isWritable: true },
    { pubkey: accounts.vMint, isSigner: false, isWritable: false },
    { pubkey: accounts.veMint, isSigner: false, isWritable: false },
    { pubkey: accounts.tokenProgram, isSigner: false, isWritable: false },
    { pubkey: accounts.token2022, isSigner: false, isWritable: false },
    { pubkey: accounts.systemProgram, isSigner: false, isWritable: false },
  ];
  const identifier = Buffer.from([39, 168, 27, 49, 125, 158, 157, 136]);
  const data = identifier;
  const ix = new TransactionInstruction({ keys, programId: PROGRAM_ID, data });
  return ix;
}
