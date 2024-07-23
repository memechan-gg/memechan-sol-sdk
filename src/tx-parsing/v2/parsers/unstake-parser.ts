import { ParsedTransactionWithMeta, PublicKey } from "@solana/web3.js";
import { CHAN_TOKEN_DECIMALS, MEMECHAN_MEME_TOKEN_DECIMALS, TOKEN_INFOS } from "../../../config/config";

export type UnstakeInstructionParsed = {
  sender: PublicKey;
  stakingPoolAddress: PublicKey;
  feesMeme: number;
  feesQuote: number;
  feesChan: number;
  unstakeAmount: number;
  type: "unstake";
};

export async function parseUnstakesInstruction(
  tx: ParsedTransactionWithMeta,
  index: number,
): Promise<UnstakeInstructionParsed | undefined> {
  const ix = tx.transaction.message.instructions[index];

  if (!("accounts" in ix)) {
    return undefined;
  }

  const stakingPoolAddress = ix.accounts[0];

  if (!tx.meta?.logMessages) {
    return undefined;
  }

  const feesRegex = /fees_meme: (\d+) fees_quote: (\d+) fees_chan: (\d+)/;
  for (const log of tx.meta.logMessages) {
    const match = log.match(feesRegex);
    if (match) {
      const feesMeme = parseInt(match[1], 10) / 10 ** MEMECHAN_MEME_TOKEN_DECIMALS; // Convert to decimal with 6 places
      const feesQuote = parseInt(match[2], 10) / 10 ** TOKEN_INFOS.WSOL.decimals; // Convert to decimal with 9 places // todo make it dynamic
      const feesChan = parseInt(match[3], 10) / 10 ** CHAN_TOKEN_DECIMALS; // Convert to decimal with 9 places
      console.log(
        `fees_meme: ${feesMeme.toFixed(6)}, fees_quote: ${feesQuote.toFixed(9)}, chan: ${feesChan.toFixed(9)}`,
      );

      const withdrawFeesParsed: UnstakeInstructionParsed = {
        stakingPoolAddress: stakingPoolAddress,
        feesChan: feesChan,
        feesMeme: feesMeme,
        feesQuote: feesQuote,
        sender: tx.transaction.message.accountKeys[0].pubkey, // In the `Message` structure, the first account is always the fee-payer
        type: "unstake",
      };

      return withdrawFeesParsed;
    }
  }

  return undefined;
}
