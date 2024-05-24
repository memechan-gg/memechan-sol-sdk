import { LivePoolClient } from "../../../src/live-pool/LivePoolClient";
import { buildAndSendTx, getWalletTokenAccount } from "../../../src/util";
import { connection, payer } from "../../common";

// yarn tsx examples/live-pool/buy/buy-meme.ts > buy-meme.txt 2>&1
export const buyMeme = async () => {
  const poolAddress = "2rzXgHKH7NU9vGKfyBwtuEMtm1JvAJpg7xgYT53hHth7";
  const memeMint = "5vj496NTttpUESayDt2Mpn5jRQBqvLkMwwvJTBPVR4w1";
  const amountIn = "100"; // That's a formatted amount

  const walletTokenAccounts = await getWalletTokenAccount(connection, payer.publicKey);

  const buyTransactions = await LivePoolClient.getBuyMemeTransactions({
    poolAddress,
    memeCoinMint: memeMint,
    amountIn,
    connection,
    slippagePercentage: 0.1,
    payer: payer.publicKey,
    walletTokenAccounts,
  });
  console.log("\nbuyTransactions:", buyTransactions);

  const signatures = await buildAndSendTx(connection, payer, buyTransactions, { skipPreflight: true });
  console.log("\nbuy meme signatures:", signatures);
};

buyMeme();
