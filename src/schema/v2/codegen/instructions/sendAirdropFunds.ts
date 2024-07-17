import { TransactionInstruction, PublicKey } from "@solana/web3.js"; // eslint-disable-line @typescript-eslint/no-unused-vars
import BN from "bn.js"; // eslint-disable-line @typescript-eslint/no-unused-vars
import * as borsh from "@project-serum/borsh"; // eslint-disable-line @typescript-eslint/no-unused-vars
import * as types from "../types"; // eslint-disable-line @typescript-eslint/no-unused-vars
import { PROGRAM_ID } from "../programId";

export interface SendAirdropFundsAccounts {
  sender: PublicKey;
  staking: PublicKey;
  stakingPoolSignerPda: PublicKey;
  stakingMemeVault: PublicKey;
  memeMint: PublicKey;
  airdropTokenVault: PublicKey;
  airdropOwner: PublicKey;
  systemProgram: PublicKey;
  tokenProgram: PublicKey;
  associatedTokenProgram: PublicKey;
}

export function sendAirdropFunds(accounts: SendAirdropFundsAccounts) {
  const keys = [
    { pubkey: accounts.sender, isSigner: true, isWritable: true },
    { pubkey: accounts.staking, isSigner: false, isWritable: true },
    {
      pubkey: accounts.stakingPoolSignerPda,
      isSigner: false,
      isWritable: true,
    },
    { pubkey: accounts.stakingMemeVault, isSigner: false, isWritable: true },
    { pubkey: accounts.memeMint, isSigner: false, isWritable: false },
    { pubkey: accounts.airdropTokenVault, isSigner: false, isWritable: true },
    { pubkey: accounts.airdropOwner, isSigner: false, isWritable: false },
    { pubkey: accounts.systemProgram, isSigner: false, isWritable: false },
    { pubkey: accounts.tokenProgram, isSigner: false, isWritable: false },
    {
      pubkey: accounts.associatedTokenProgram,
      isSigner: false,
      isWritable: false,
    },
  ];
  const identifier = Buffer.from([28, 233, 107, 49, 246, 236, 215, 26]);
  const data = identifier;
  const ix = new TransactionInstruction({ keys, programId: PROGRAM_ID, data });
  return ix;
}
