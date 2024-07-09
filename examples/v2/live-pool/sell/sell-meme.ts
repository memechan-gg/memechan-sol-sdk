import { PublicKey, sendAndConfirmTransaction } from "@solana/web3.js";
import { LivePoolClientV2 } from "../../../../src";
import { clientV2, connection, payer } from "../../../common";

// yarn tsx examples/v2/live-pool/sell/sell-meme.ts > sell-meme.txt 2>&1
export const sellMeme = async () => {
  const poolAddress = "69fywDppk1B9tXtGQJDiRKDcV8My6NLuyHgAmSToT6bZ";
  const memeMint = "8NmKFkMehRoF9BLSajM9xioitxKWSfXTxw2qrtPtyE2z";
  const amountIn = "100"; // That's a formatted amount
  const poolClient = await LivePoolClientV2.fromAmmId(new PublicKey(poolAddress), clientV2);

  const sellTransactions = await poolClient.getSellMemeTransactions({
    poolAddress,
    memeCoinMint: memeMint,
    amountIn,
    connection,
    slippagePercentage: 20,
    payer: payer.publicKey,
  });
  console.log("\nsellTransactions:", sellTransactions);

  const sig = await sendAndConfirmTransaction(clientV2.connection, sellTransactions, [payer], {
    skipPreflight: true,
    commitment: "confirmed",
  });
  console.log("\nsell meme signatures:", sig);
};

sellMeme();
