import { client, payer } from "../common";
import { MintUtils } from "../../src/token/mintUtils";
import { PublicKey, Transaction, sendAndConfirmTransaction } from "@solana/web3.js";
import { createTransferInstruction } from "@solana/spl-token";
import { TOKEN_INFOS } from "../../src";

// yarn tsx examples/slerf/send-devnet-slerf.ts > send-slerf.txt 2>&1
export const sendSlerf = async () => {
  console.log("payer: " + payer.publicKey.toString());
  console.log("quote token to send: " + TOKEN_INFOS.SLERF.mint.toString());

  const mintUtils = new MintUtils(client.connection, payer);

  const toWallet = new PublicKey("3UfiokHNzQKup3U7YwYQAiF1yzem2hX2LpgXsHLhcT2L");

  const fromTokenAccount = await mintUtils.getOrCreateTokenAccount(TOKEN_INFOS.SLERF.mint, payer, payer.publicKey);
  const toTokenAccount = await mintUtils.getOrCreateTokenAccount(TOKEN_INFOS.SLERF.mint, payer, toWallet);
  console.log("toTokenAccount:", toTokenAccount);

  const transaction = new Transaction().add(
    createTransferInstruction(fromTokenAccount.address, toTokenAccount.address, payer.publicKey, 1 * 1e9),
  );

  const result = await sendAndConfirmTransaction(client.connection, transaction, [payer], {
    commitment: "confirmed",
    skipPreflight: true,
  });
  console.log("result:", result);
};

sendSlerf();
