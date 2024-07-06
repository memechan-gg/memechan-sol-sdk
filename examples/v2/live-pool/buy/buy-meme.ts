import { sendAndConfirmTransaction } from "@solana/web3.js";
import { LivePoolClientV2 } from "../../../../src";
import { clientV2, connection, payer } from "../../../common";

// yarn tsx examples/v2/live-pool/buy/buy-meme.ts > buy-meme.txt 2>&1
export const buyMeme = async () => {
  const poolAddress = "69fywDppk1B9tXtGQJDiRKDcV8My6NLuyHgAmSToT6bZ";
  const memeMint = "8NmKFkMehRoF9BLSajM9xioitxKWSfXTxw2qrtPtyE2z";
  const amountIn = "0.0001"; // That's a formatted amount

  const buyTransactions = await LivePoolClientV2.getBuyMemeTransactions({
    poolAddress,
    memeCoinMint: memeMint,
    amountIn,
    connection,
    slippagePercentage: 20,
    payer: payer.publicKey,
  });
  console.log("\nbuyTransactions:", buyTransactions);

  const sig = await sendAndConfirmTransaction(clientV2.connection, buyTransactions, [payer], {
    skipPreflight: true,
    commitment: "confirmed",
  });
  console.log("\nbuy meme signatures:", sig);
};

buyMeme();
