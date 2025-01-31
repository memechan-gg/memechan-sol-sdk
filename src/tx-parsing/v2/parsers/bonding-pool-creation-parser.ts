import { ParsedTransactionWithMeta, PublicKey } from "@solana/web3.js";
import { IdlAccounts } from "@coral-xyz/anchor";
import type { Mint } from "@solana/spl-token";
import { MemechanClientV2 } from "../../../MemechanClientV2";
import { MemechanSol } from "../../../schema/v2/v2";

type Pool = IdlAccounts<MemechanSol>["boundPool"];

export type NewBPInstructionParsed = {
  sender: PublicKey;
  poolAddr: PublicKey;
  pool: Pool;
  newMint: Mint;
  type: "new_pool";
};

export async function parseNewBPInstruction(
  tx: ParsedTransactionWithMeta,
  index: number,
  client: MemechanClientV2,
): Promise<NewBPInstructionParsed | undefined> {
  let poolAddr = PublicKey.default;
  const ix = tx.transaction.message.instructions[index];

  if ("accounts" in ix && ix.accounts.length > 2) {
    // to ensure we also have a mint, which has index of 2
    poolAddr = ix.accounts[1];
  } else {
    return undefined;
  }

  const pool = await client.memechanProgram.account.boundPool.fetchNullable(poolAddr);

  if (pool === null) {
    return undefined;
  }

  const newMintAddr = ix.accounts[2];
  const { getMint } = await import("@solana/spl-token");
  const newMint = await getMint(client.connection, newMintAddr);

  const bpParsed: NewBPInstructionParsed = {
    poolAddr,
    pool,
    newMint,
    // In the `Message` structure, the first account is always the fee-payer
    sender: tx.transaction.message.accountKeys[0].pubkey,
    type: "new_pool",
  };

  return bpParsed;
}
