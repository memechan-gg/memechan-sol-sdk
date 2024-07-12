import { TransactionSignature } from "@solana/web3.js";
import * as base58 from "bs58";

import * as solana from "@solana/web3.js";
import { NewBPInstructionParsed, parseNewBPInstruction } from "./parsers/bonding-pool-creation-parser";
import { InitStakingPoolInstructionParsed, parseInitStakingInstruction } from "./parsers/init-staking-parser";
import { parseSwapXInstruction, SwapXInstructionParsed } from "./parsers/swap-x-parser";
import { parseSwapYInstruction, SwapYInstructionParsed } from "./parsers/swap-y-parser";
import { CreateMetadataInstructionParsed, parseCreateMetadataInstruction } from "./parsers/create-metadata-parser";
import { InitQuoteAmmInstructionParsed, parseInitQuoteAmmInstruction } from "./parsers/init-quote-amm-parser";
import { InitChanAmmInstructionParsed, parseInitChanAmmInstruction } from "./parsers/init-chan-amm-parser";
import { MemechanClientV2 } from "../../MemechanClientV2";

export async function parseTxV2(
  txSig: TransactionSignature,
  client: MemechanClientV2,
): Promise<
  | (
      | NewBPInstructionParsed
      | SwapYInstructionParsed
      | SwapXInstructionParsed
      | InitStakingPoolInstructionParsed
      | CreateMetadataInstructionParsed
      | InitQuoteAmmInstructionParsed
      | InitChanAmmInstructionParsed
    )[]
  | undefined
> {
  const pt = await client.connection.getParsedTransaction(txSig, { maxSupportedTransactionVersion: 0 });
  // console.log(pt);

  const ixs = pt?.transaction?.message.instructions;
  if (!ixs) {
    return undefined;
  }

  const res: (
    | NewBPInstructionParsed
    | SwapYInstructionParsed
    | SwapXInstructionParsed
    | InitStakingPoolInstructionParsed
    | CreateMetadataInstructionParsed
    | InitQuoteAmmInstructionParsed
    | InitChanAmmInstructionParsed
  )[] = [];

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

  return undefined;
}
