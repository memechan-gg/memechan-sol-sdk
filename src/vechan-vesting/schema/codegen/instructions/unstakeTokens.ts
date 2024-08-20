import { TransactionInstruction, PublicKey } from "@solana/web3.js"; // eslint-disable-line @typescript-eslint/no-unused-vars
import BN from "bn.js"; // eslint-disable-line @typescript-eslint/no-unused-vars
import * as borsh from "@project-serum/borsh"; // eslint-disable-line @typescript-eslint/no-unused-vars
import { PROGRAM_ID } from "../programId";

export interface UnstakeTokensAccounts {
  signer: PublicKey;
  stake: PublicKey;
  stakeSigner: PublicKey;
  stakingState: PublicKey;
  vault: PublicKey;
  userVAcc: PublicKey;
  userVeAcc: PublicKey;
  vMint: PublicKey;
  veMint: PublicKey;
  tokenProgram: PublicKey;
  token2022: PublicKey;
  systemProgram: PublicKey;
}

export function unstakeTokens(accounts: UnstakeTokensAccounts) {
  const keys = [
    { pubkey: accounts.signer, isSigner: true, isWritable: false },
    { pubkey: accounts.stake, isSigner: false, isWritable: true },
    { pubkey: accounts.stakeSigner, isSigner: false, isWritable: false },
    { pubkey: accounts.stakingState, isSigner: false, isWritable: true },
    { pubkey: accounts.vault, isSigner: false, isWritable: true },
    { pubkey: accounts.userVAcc, isSigner: false, isWritable: true },
    { pubkey: accounts.userVeAcc, isSigner: false, isWritable: true },
    { pubkey: accounts.vMint, isSigner: false, isWritable: false },
    { pubkey: accounts.veMint, isSigner: false, isWritable: true },
    { pubkey: accounts.tokenProgram, isSigner: false, isWritable: false },
    { pubkey: accounts.token2022, isSigner: false, isWritable: false },
    { pubkey: accounts.systemProgram, isSigner: false, isWritable: false },
  ];
  const identifier = Buffer.from([58, 119, 215, 143, 203, 223, 32, 86]);
  const data = identifier;
  const ix = new TransactionInstruction({ keys, programId: PROGRAM_ID, data });
  return ix;
}
