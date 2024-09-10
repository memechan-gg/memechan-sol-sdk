import { TransactionInstruction, PublicKey } from "@solana/web3.js"; // eslint-disable-line @typescript-eslint/no-unused-vars
import BN from "bn.js"; // eslint-disable-line @typescript-eslint/no-unused-vars
import * as borsh from "@project-serum/borsh"; // eslint-disable-line @typescript-eslint/no-unused-vars
import * as types from "../types"; // eslint-disable-line @typescript-eslint/no-unused-vars
import { PROGRAM_ID } from "../programId";

export interface ChangePointsEpochArgs {
  epochNumber: BN;
  pointsPerSolNum: BN;
  pointsPerSolDenom: BN;
}

export interface ChangePointsEpochAccounts {
  sender: PublicKey;
  pointsEpoch: PublicKey;
  systemProgram: PublicKey;
}

export const layout = borsh.struct([
  borsh.u64("epochNumber"),
  borsh.u64("pointsPerSolNum"),
  borsh.u64("pointsPerSolDenom"),
]);

export function changePointsEpoch(args: ChangePointsEpochArgs, accounts: ChangePointsEpochAccounts) {
  const keys = [
    { pubkey: accounts.sender, isSigner: true, isWritable: true },
    { pubkey: accounts.pointsEpoch, isSigner: false, isWritable: true },
    { pubkey: accounts.systemProgram, isSigner: false, isWritable: false },
  ];
  const identifier = Buffer.from([58, 65, 242, 124, 238, 69, 132, 124]);
  const buffer = Buffer.alloc(1000);
  const len = layout.encode(
    {
      epochNumber: args.epochNumber,
      pointsPerSolNum: args.pointsPerSolNum,
      pointsPerSolDenom: args.pointsPerSolDenom,
    },
    buffer,
  );
  const data = Buffer.concat([identifier, buffer]).slice(0, 8 + len);
  const ix = new TransactionInstruction({ keys, programId: PROGRAM_ID, data });
  return ix;
}
