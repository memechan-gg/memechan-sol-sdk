import { TransactionInstruction, PublicKey } from "@solana/web3.js"; // eslint-disable-line @typescript-eslint/no-unused-vars
import BN from "bn.js"; // eslint-disable-line @typescript-eslint/no-unused-vars
import * as borsh from "@project-serum/borsh"; // eslint-disable-line @typescript-eslint/no-unused-vars
import * as types from "../types"; // eslint-disable-line @typescript-eslint/no-unused-vars
import { PROGRAM_ID } from "../programId";

export interface CreateMetadataArgs {
  name: string;
  symbol: string;
  uri: string;
}

export interface CreateMetadataAccounts {
  sender: PublicKey;
  pool: PublicKey;
  memeMint: PublicKey;
  memeMplMetadata: PublicKey;
  poolSigner: PublicKey;
  systemProgram: PublicKey;
  tokenProgram: PublicKey;
  metadataProgram: PublicKey;
  rent: PublicKey;
}

export const layout = borsh.struct([borsh.str("name"), borsh.str("symbol"), borsh.str("uri")]);

export function createMetadata(args: CreateMetadataArgs, accounts: CreateMetadataAccounts) {
  const keys = [
    { pubkey: accounts.sender, isSigner: true, isWritable: true },
    { pubkey: accounts.pool, isSigner: false, isWritable: false },
    { pubkey: accounts.memeMint, isSigner: false, isWritable: true },
    { pubkey: accounts.memeMplMetadata, isSigner: false, isWritable: true },
    { pubkey: accounts.poolSigner, isSigner: false, isWritable: false },
    { pubkey: accounts.systemProgram, isSigner: false, isWritable: false },
    { pubkey: accounts.tokenProgram, isSigner: false, isWritable: false },
    { pubkey: accounts.metadataProgram, isSigner: false, isWritable: false },
    { pubkey: accounts.rent, isSigner: false, isWritable: false },
  ];
  const identifier = Buffer.from([30, 35, 117, 134, 196, 139, 44, 25]);
  const buffer = Buffer.alloc(1000);
  const len = layout.encode(
    {
      name: args.name,
      symbol: args.symbol,
      uri: args.uri,
    },
    buffer,
  );
  const data = Buffer.concat([identifier, buffer]).slice(0, 8 + len);
  const ix = new TransactionInstruction({ keys, programId: PROGRAM_ID, data });
  return ix;
}
