import { Connection, TransactionSignature } from "@solana/web3.js"
import * as base58 from "bs58"

import * as solana from "@solana/web3.js"
import { NewBPInstructionParsed, ParseNewBPInstruction } from "./parsers/bonding-pool-creation-parser";
import { ParseSwapYInstruction, SwapYInstructionParsed } from "./parsers/swap-y-parser";
import { InitStakingPoolInstructionParsed, ParseInitStakingInstruction } from "./parsers/init-staking-parser";
import { GoLiveInstructionParsed, ParseGoLiveInstruction } from "./parsers/go-live-parser";
import { MemechanClient } from "../MemechanClient";
import { ParseSwapXInstruction, SwapXInstructionParsed } from "./parsers/swap-x-parser";

export async function ParseTx(txSig: TransactionSignature, client: MemechanClient): Promise<(NewBPInstructionParsed | SwapYInstructionParsed | SwapXInstructionParsed | InitStakingPoolInstructionParsed | GoLiveInstructionParsed)[] | undefined> {
    const pt = await client.connection.getParsedTransaction(txSig);
    //console.log(pt);

    const ixs = pt?.transaction?.message.instructions;
    if (!ixs) {
        return undefined
    }

    const res: (NewBPInstructionParsed | SwapYInstructionParsed | SwapXInstructionParsed | InitStakingPoolInstructionParsed | GoLiveInstructionParsed)[] = [];

    for (let i = 0; i < ixs.length; i++) {
        const ix = ixs[i];
        if (ix.programId.equals(client.memechanProgram.programId)) {
            if ("data" in ix) {
                const ixBytes = base58.decode(ix.data);
                const pres = await ptx(ixBytes, pt, i, client);
                if (pres) {
                    res.push(pres);
                }
            }
        } else continue;
    }

    return res
}

async function ptx(ixBytes: Buffer, tx: solana.ParsedTransactionWithMeta, index: number, memechanProgram: MemechanClient): Promise<NewBPInstructionParsed | SwapYInstructionParsed | SwapXInstructionParsed | InitStakingPoolInstructionParsed | GoLiveInstructionParsed | undefined> {
    const ixBytesSliced = ixBytes.subarray(0, 2);
    if (ixBytesSliced.equals(Buffer.from([0x87, 0x2C]))) {
        console.log("parsing ix: New")
        return await ParseNewBPInstruction(tx, index, memechanProgram)
    }
    if (ixBytesSliced.equals(Buffer.from([0x41, 0x3F]))) {
        console.log("parsing ix: SwapX")
        return await ParseSwapXInstruction(tx, index, memechanProgram)
    }
    if (ixBytesSliced.equals(Buffer.from([0x7E, 0xD0]))) {
        console.log("parsing ix: SwapY")
        return await ParseSwapYInstruction(tx, index, memechanProgram)
    }
    if (ixBytesSliced.equals(Buffer.from([0x68, 0xC1]))) {
        console.log("parsing ix: InitStaking")
        return await ParseInitStakingInstruction(tx, index, memechanProgram)
    }
    if (ixBytesSliced.equals(Buffer.from([0x7E, 0x62]))) {
        console.log("parsing ix: GoLive")
        return await ParseGoLiveInstruction(tx, index)
    }


    return undefined
}