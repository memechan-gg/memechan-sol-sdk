import { TransactionSignature } from "@solana/web3.js";
import * as base58 from "bs58";

import * as solana from "@solana/web3.js";
import { parseNewBPInstruction } from "./parsers/bonding-pool-creation-parser";
import { parseInitStakingInstruction } from "./parsers/init-staking-parser";
import { parseSwapXInstruction } from "./parsers/swap-x-parser";
import { parseSwapYInstruction } from "./parsers/swap-y-parser";
import { parseCreateMetadataInstruction } from "./parsers/create-metadata-parser";
import { parseInitQuoteAmmInstruction } from "./parsers/init-quote-amm-parser";
import { parseInitChanAmmInstruction } from "./parsers/init-chan-amm-parser";
import { MemechanClientV2 } from "../../MemechanClientV2";
import { parseUnstakesInstruction } from "./parsers/unstake-parser";
import { parseWithdrawFeesInstruction } from "./parsers/withdraw-fees-parser";
import { ParsedTransactionDetail } from "./types";

export async function parseTxV2(
  txSig: TransactionSignature,
  client: MemechanClientV2,
): Promise<ParsedTransactionDetail[] | undefined> {
  const pt = await client.connection.getParsedTransaction(txSig, { maxSupportedTransactionVersion: 0 });
  // console.log(pt);

  const ixs = pt?.transaction?.message.instructions;
  if (!ixs) {
    return undefined;
  }

  const res: ParsedTransactionDetail[] = [];

  for (let i = 0; i < ixs.length; i++) {
    const ix = ixs[i];
    if (ix.programId.equals(client.memechanProgram.programId)) {
      if ("data" in ix) {
        const ixBytes = base58.decode(ix.data);
        const buffer = Buffer.from(ixBytes);
        const pres = await ptx(buffer, pt, i, client);
        if (pres) {
          res.push(pres);
        }
      }
    } else continue;
  }

  return res;
}

async function ptx(
  ixBytes: Buffer,
  tx: solana.ParsedTransactionWithMeta,
  index: number,
  memechanProgram: MemechanClientV2,
) {
  const ixBytesSliced = ixBytes.subarray(0, 2);

  if (ixBytesSliced.equals(Buffer.from([0x26, 0x3f]))) {
    console.log("parsing ix: NewPool");
    return await parseNewBPInstruction(tx, index, memechanProgram);
  }
  if (ixBytesSliced.equals(Buffer.from([0x1e, 0x23]))) {
    console.log("parsing ix: CreateMetadata");
    return await parseCreateMetadataInstruction(tx, index, memechanProgram);
  }
  if (ixBytesSliced.equals(Buffer.from([0x41, 0x3f]))) {
    console.log("parsing ix: SwapX");
    return await parseSwapXInstruction(tx, index, memechanProgram);
  }
  if (ixBytesSliced.equals(Buffer.from([0x7e, 0xd0]))) {
    console.log("parsing ix: SwapY");
    return await parseSwapYInstruction(tx, index, memechanProgram);
  }
  if (ixBytesSliced.equals(Buffer.from([0x68, 0xc1]))) {
    console.log("parsing ix: InitStaking");
    return await parseInitStakingInstruction(tx, index, memechanProgram);
  }
  if (ixBytesSliced.equals(Buffer.from([0xaf, 0x3a]))) {
    console.log("parsing ix: InitQuoteAmm");
    return await parseInitQuoteAmmInstruction(tx, index);
  }
  if (ixBytesSliced.equals(Buffer.from([0x81, 0x08]))) {
    console.log("parsing ix: InitChanAmm");
    return await parseInitChanAmmInstruction(tx, index);
  }
  if (ixBytesSliced.equals(Buffer.from([0x5a, 0x5f]))) {
    console.log("parsing ix: Unstake");
    return await parseUnstakesInstruction(tx, index);
  }
  if (ixBytesSliced.equals(Buffer.from([0xc6, 0xd4]))) {
    console.log("parsing ix: WithdrawFees");
    return await parseWithdrawFeesInstruction(tx, index);
  }

  return undefined;
}
