import { ParsedTransactionWithMeta, PublicKey } from "@solana/web3.js";
import { IdlAccounts, Program } from "@coral-xyz/anchor";
import { MemechanClient } from "../../MemechanClient";
import { MemechanSol } from "../../schema/types/memechan_sol";

export type Pool = IdlAccounts<MemechanSol>["boundPool"]

export type NewBPInstructionParsed = {
    sender: PublicKey,
    poolAddr: PublicKey,
    pool: Pool,
}

export async function ParseNewBPInstruction(tx: ParsedTransactionWithMeta, index: number, client: MemechanClient): Promise<NewBPInstructionParsed | undefined> {
    var poolAddr = PublicKey.default;
    const ix = tx.transaction.message.instructions[index];

    if ("accounts" in ix && ix.accounts.length > 1) {
        poolAddr = ix.accounts[1];
    } else {
        return undefined
    }

    const pool = await client.memechanProgram.account.boundPool.fetchNullable(poolAddr);

    if (pool === null) {
        return undefined
    }

    const bpParsed: NewBPInstructionParsed = {
        poolAddr,
        pool,
        sender: tx.transaction.message.accountKeys[0].pubkey // In the `Message` structure, the first account is always the fee-payer
    };

    return bpParsed
}