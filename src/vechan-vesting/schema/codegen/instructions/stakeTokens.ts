import { TransactionInstruction, PublicKey } from "@solana/web3.js"; // eslint-disable-line @typescript-eslint/no-unused-vars
import BN from "bn.js"; // eslint-disable-line @typescript-eslint/no-unused-vars
import * as borsh from "@project-serum/borsh"; // eslint-disable-line @typescript-eslint/no-unused-vars
import { PROGRAM_ID } from "../programId";

export interface StakeTokensArgs {
  lockupTime: BN;
  tokensToUse: BN;
}

export interface StakeTokensAccounts {
  signer: PublicKey;
  vesting: PublicKey;
  stake: PublicKey;
  stakeSigner: PublicKey;
  stakingState: PublicKey;
  stakingStateSigner: PublicKey;
  vault: PublicKey;
  userVAcc: PublicKey;
  userVeAcc: PublicKey;
  vMint: PublicKey;
  veMint: PublicKey;
  tokenProgram: PublicKey;
  token2022: PublicKey;
  systemProgram: PublicKey;
}

export const layout = borsh.struct([borsh.u64("lockupTime"), borsh.u64("tokensToUse")]);

export function stakeTokens(args: StakeTokensArgs, accounts: StakeTokensAccounts) {
  const keys = [
    { pubkey: accounts.signer, isSigner: true, isWritable: true },
    { pubkey: accounts.vesting, isSigner: false, isWritable: false },
    { pubkey: accounts.stake, isSigner: true, isWritable: true },
    { pubkey: accounts.stakeSigner, isSigner: false, isWritable: false },
    { pubkey: accounts.stakingState, isSigner: false, isWritable: true },
    { pubkey: accounts.stakingStateSigner, isSigner: false, isWritable: false },
    { pubkey: accounts.vault, isSigner: false, isWritable: true },
    { pubkey: accounts.userVAcc, isSigner: false, isWritable: true },
    { pubkey: accounts.userVeAcc, isSigner: false, isWritable: true },
    { pubkey: accounts.vMint, isSigner: false, isWritable: false },
    { pubkey: accounts.veMint, isSigner: false, isWritable: true },
    { pubkey: accounts.tokenProgram, isSigner: false, isWritable: false },
    { pubkey: accounts.token2022, isSigner: false, isWritable: false },
    { pubkey: accounts.systemProgram, isSigner: false, isWritable: false },
  ];
  const identifier = Buffer.from([136, 126, 91, 162, 40, 131, 13, 127]);
  const buffer = Buffer.alloc(1000);
  const len = layout.encode(
    {
      lockupTime: args.lockupTime,
      tokensToUse: args.tokensToUse,
    },
    buffer,
  );
  const data = Buffer.concat([identifier, buffer]).slice(0, 8 + len);
  const ix = new TransactionInstruction({ keys, programId: PROGRAM_ID, data });
  return ix;
}
