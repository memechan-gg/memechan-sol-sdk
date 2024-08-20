import { TransactionInstruction, PublicKey } from "@solana/web3.js"; // eslint-disable-line @typescript-eslint/no-unused-vars
import BN from "bn.js"; // eslint-disable-line @typescript-eslint/no-unused-vars
import * as borsh from "@project-serum/borsh"; // eslint-disable-line @typescript-eslint/no-unused-vars
import { PROGRAM_ID } from "../programId";

export interface ConvertVestingToVchanAccounts {
  vesting: PublicKey;
  vestingVault: PublicKey;
  vestingSigner: PublicKey;
  chanMint: PublicKey;
  beneficiary: PublicKey;
  stake: PublicKey;
  stakeSigner: PublicKey;
  stakingState: PublicKey;
  stakingStateSigner: PublicKey;
  vault: PublicKey;
  userVeAcc: PublicKey;
  vMint: PublicKey;
  veMint: PublicKey;
  depositorTokenAccount: PublicKey;
  depositorAuthority: PublicKey;
  tokenProgram: PublicKey;
  token2022: PublicKey;
  systemProgram: PublicKey;
}

export function convertVestingToVchan(accounts: ConvertVestingToVchanAccounts) {
  const keys = [
    { pubkey: accounts.vesting, isSigner: false, isWritable: true },
    { pubkey: accounts.vestingVault, isSigner: false, isWritable: true },
    { pubkey: accounts.vestingSigner, isSigner: false, isWritable: false },
    { pubkey: accounts.chanMint, isSigner: false, isWritable: true },
    { pubkey: accounts.beneficiary, isSigner: false, isWritable: false },
    { pubkey: accounts.stake, isSigner: true, isWritable: true },
    { pubkey: accounts.stakeSigner, isSigner: false, isWritable: false },
    { pubkey: accounts.stakingState, isSigner: false, isWritable: true },
    { pubkey: accounts.stakingStateSigner, isSigner: false, isWritable: false },
    { pubkey: accounts.vault, isSigner: false, isWritable: true },
    { pubkey: accounts.userVeAcc, isSigner: false, isWritable: true },
    { pubkey: accounts.vMint, isSigner: false, isWritable: false },
    { pubkey: accounts.veMint, isSigner: false, isWritable: true },
    {
      pubkey: accounts.depositorTokenAccount,
      isSigner: false,
      isWritable: true,
    },
    { pubkey: accounts.depositorAuthority, isSigner: true, isWritable: true },
    { pubkey: accounts.tokenProgram, isSigner: false, isWritable: false },
    { pubkey: accounts.token2022, isSigner: false, isWritable: false },
    { pubkey: accounts.systemProgram, isSigner: false, isWritable: false },
  ];
  const identifier = Buffer.from([162, 146, 65, 11, 58, 96, 30, 231]);
  const data = identifier;
  const ix = new TransactionInstruction({ keys, programId: PROGRAM_ID, data });
  return ix;
}
