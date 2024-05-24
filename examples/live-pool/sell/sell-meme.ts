import { LivePoolClient } from "../../../src/live-pool/LivePoolClient";
import { buildAndSendTx, getWalletTokenAccount } from "../../../src/util";
import { connection, payer } from "../../common";

// yarn tsx examples/live-pool/sell/sell-meme.ts > sell-meme.txt 2>&1
export const sellMeme = async () => {
  const poolAddress = "2rzXgHKH7NU9vGKfyBwtuEMtm1JvAJpg7xgYT53hHth7";
  const memeMint = "5vj496NTttpUESayDt2Mpn5jRQBqvLkMwwvJTBPVR4w1";
  const amountIn = "1000"; // That's a formatted amount

  const walletTokenAccounts = await getWalletTokenAccount(connection, payer.publicKey);

  const sellTransactions = await LivePoolClient.getSellMemeTransactions({
    poolAddress,
    memeCoinMint: memeMint,
    amountIn,
    connection,
    slippagePercentage: 0.1,
    payer: payer.publicKey,
    walletTokenAccounts,
  });
  console.log("\nsellTransactions:", sellTransactions);

  const signatures = await buildAndSendTx(connection, payer, sellTransactions, { skipPreflight: true });
  console.log("\nsell meme signatures:", signatures);
};

sellMeme();
