import { ParsedTransactionWithMeta, PublicKey } from "@solana/web3.js";

export type GoLiveInstructionParsed = {
    raydiumPoolAddr: PublicKey,
}

export async function ParseGoLiveInstruction(tx: ParsedTransactionWithMeta, index: number) {
    const ix = tx.transaction.message.instructions[index]

    if (!("accounts" in ix)) {
        return undefined
    }

    const raydiumPoolAddr = ix.accounts[10];

    const glParsed: GoLiveInstructionParsed = {
        raydiumPoolAddr
    };

    return glParsed;
}