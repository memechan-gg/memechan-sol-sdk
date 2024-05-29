import { BN } from "@coral-xyz/anchor";
import { BoundPoolClient } from "../src/bound-pool/BoundPoolClient";
import { sleep } from "../src/common/helpers";
import { client, payer } from "./common/common";
import {
  MEMECHAN_MEME_TOKEN_DECIMALS,
  MEMECHAN_QUOTE_TOKEN,
  MEMECHAN_QUOTE_TOKEN_DECIMALS,
} from "../src/config/config";
import { MemeTicketClient } from "../src/memeticket/MemeTicketClient";
import { PublicKey, sendAndConfirmTransaction } from "@solana/web3.js";
import { getTokenBalanceForWallet } from "../src/util/getTokenAccountBalance";
import { normalizeInputCoinAmount } from "../src/util/trading/normalizeInputCoinAmount";
import { connection } from "../examples/common";

const BUY_SELL_BOUND_POOL_ID = new PublicKey("HCRVDUJgvLGiRh9oDpW63a3dyPAM8rJoxQXrfVbZSABv");
const SLEEP_TIME = 60000;

describe("BoundPoolClient Trading", () => {
  it("buy meme tokens tx", async () => {
    const poolAccountAddressId = BUY_SELL_BOUND_POOL_ID;
    const boundPoolInstance = await BoundPoolClient.fromBoundPoolId({ client, poolAccountAddressId });

    const inputQuoteAmount = "1";
    const minMemeOutputAmount = await boundPoolInstance.getOutputAmountForBuyMeme({
      inputAmount: inputQuoteAmount,
      slippagePercentage: 0,
    });

    console.log("minMemeOutputAmount: ", minMemeOutputAmount);
    const { availableAmountWithDecimals: availableAmountWithDecimalsBefore } =
      await MemeTicketClient.fetchAvailableTicketsByUser(poolAccountAddressId, client, payer.publicKey);

    console.log("availableAmountWithDecimalsBefore: ", availableAmountWithDecimalsBefore);

    const quoteTokenBalanceBefore = await getTokenBalanceForWallet(
      connection,
      payer.publicKey,
      MEMECHAN_QUOTE_TOKEN.mint,
    );
    console.log("quoteTokenBalanceBefore: ", quoteTokenBalanceBefore);

    const { tx, memeTicketKeypair } = await boundPoolInstance.getBuyMemeTransaction({
      inputAmount: inputQuoteAmount,
      minOutputAmount: minMemeOutputAmount,
      slippagePercentage: 0,
      user: payer.publicKey,
    });

    const latestBlockhash = await client.connection.getLatestBlockhash("confirmed");
    tx.recentBlockhash = latestBlockhash.blockhash;
    tx.lastValidBlockHeight = latestBlockhash.lastValidBlockHeight;

    const signature = await sendAndConfirmTransaction(client.connection, tx, [payer, memeTicketKeypair], {
      commitment: "confirmed",
      skipPreflight: true,
      preflightCommitment: "confirmed",
    });

    console.log("signature: " + signature);

    let retries = 5;
    let availableAmountWithDecimalsAfter = "0";
    while (retries > 0) {
      const { availableAmountWithDecimals } = await MemeTicketClient.fetchAvailableTicketsByUser(
        poolAccountAddressId,
        client,
        payer.publicKey,
      );
      if (availableAmountWithDecimals !== availableAmountWithDecimalsBefore) {
        availableAmountWithDecimalsAfter = availableAmountWithDecimals;
        break;
      }
      console.log("Retrying to fetch updated state...");
      await sleep(15000);
      retries--;
    }

    console.log("availableAmountWithDecimalsAfter: ", availableAmountWithDecimalsAfter);

    const quoteTokenBalanceAfter = await getTokenBalanceForWallet(
      connection,
      payer.publicKey,
      MEMECHAN_QUOTE_TOKEN.mint,
    );
    console.log("quoteTokenBalanceAfter: ", quoteTokenBalanceAfter);

    const beforeBN = new BN(
      normalizeInputCoinAmount(availableAmountWithDecimalsBefore, MEMECHAN_MEME_TOKEN_DECIMALS).toString(),
    );
    const afterBN = new BN(
      normalizeInputCoinAmount(availableAmountWithDecimalsAfter, MEMECHAN_MEME_TOKEN_DECIMALS).toString(),
    );
    const minMemeOutputAmountBN = new BN(
      normalizeInputCoinAmount(minMemeOutputAmount, MEMECHAN_MEME_TOKEN_DECIMALS).toString(),
    );

    console.log("beforeBN: ", beforeBN.toString());
    console.log("afterBN: ", afterBN.toString());
    console.log("minMemeOutputAmountBN: ", minMemeOutputAmountBN.toString());
    console.log("afterBN.sub(beforeBN): ", afterBN.sub(beforeBN).toString());

    expect(afterBN.sub(beforeBN).gte(minMemeOutputAmountBN)).toBeTruthy();
  }, 150000);

  it.skip("sell meme tokens tx", async () => {
    const poolAccountAddressId = BUY_SELL_BOUND_POOL_ID;
    const boundPoolInstance = await BoundPoolClient.fromBoundPoolId({ client, poolAccountAddressId });

    const inputMemeAmount = "20000000";
    const minQuoteOutputAmount = await boundPoolInstance.getOutputAmountForSellMeme({
      inputAmount: inputMemeAmount,
      slippagePercentage: 0,
    });

    console.log("minQuoteOutputAmount: ", minQuoteOutputAmount);

    const quoteTokenBalanceBefore = await getTokenBalanceForWallet(
      connection,
      payer.publicKey,
      MEMECHAN_QUOTE_TOKEN.mint,
    );
    console.log("quoteTokenBalanceBefore: ", quoteTokenBalanceBefore);

    const txResult = await boundPoolInstance.getSellMemeTransaction({
      inputAmount: inputMemeAmount,
      minOutputAmount: minQuoteOutputAmount,
      slippagePercentage: 0,
      user: payer.publicKey,
    });

    for (const tx of txResult.txs) {
      const latestBlockhash = await client.connection.getLatestBlockhash("confirmed");
      tx.recentBlockhash = latestBlockhash.blockhash;
      tx.lastValidBlockHeight = latestBlockhash.lastValidBlockHeight;

      const signature = await sendAndConfirmTransaction(client.connection, tx, [payer], {
        commitment: "confirmed",
        skipPreflight: true,
        preflightCommitment: "confirmed",
      });

      console.log("signature: " + signature);
    }
    await sleep(SLEEP_TIME);

    const quoteTokenBalanceAfter = await getTokenBalanceForWallet(
      connection,
      payer.publicKey,
      MEMECHAN_QUOTE_TOKEN.mint,
    );
    console.log("quoteTokenBalanceAfter: ", quoteTokenBalanceAfter);

    const beforeBN = new BN(
      normalizeInputCoinAmount(quoteTokenBalanceBefore, MEMECHAN_QUOTE_TOKEN_DECIMALS).toString(),
    );
    const afterBN = new BN(normalizeInputCoinAmount(quoteTokenBalanceAfter, MEMECHAN_QUOTE_TOKEN_DECIMALS).toString());
    const minQuoteOutputAmountBN = new BN(
      normalizeInputCoinAmount(minQuoteOutputAmount, MEMECHAN_QUOTE_TOKEN_DECIMALS).toString(),
    );

    expect(afterBN.sub(beforeBN).gt(minQuoteOutputAmountBN)).toBeTruthy();
  }, 150000);

  describe.skip("Edge Cases", () => {
    it("handles zero input amount for sellMeme", async () => {
      const poolAccountAddressId = new PublicKey("FrZBDKqxoNeyLYjLn2KM2nnVRWwpzZvM2i9kUx61xDVA");
      const boundPoolInstance = await BoundPoolClient.fromBoundPoolId({ client, poolAccountAddressId });

      const inputAmount = "0";
      const minOutputAmount = await boundPoolInstance.getOutputAmountForSellMeme({
        inputAmount: inputAmount,
        slippagePercentage: 0,
      });

      // await expect(
      const result = boundPoolInstance.sellMeme({
        inputAmount: inputAmount,
        minOutputAmount: minOutputAmount,
        slippagePercentage: 0,
        user: payer.publicKey,
        signer: payer,
      });

      console.log("sellMeme result: ", result);
      // ).rejects.toThrow();
    }, 150000);

    it("handles negative input amount for buyMeme", async () => {
      const poolAccountAddressId = new PublicKey("FrZBDKqxoNeyLYjLn2KM2nnVRWwpzZvM2i9kUx61xDVA");
      const boundPoolInstance = await BoundPoolClient.fromBoundPoolId({ client, poolAccountAddressId });

      const inputAmount = "-500608";
      //  await expect(
      const amount = await boundPoolInstance.getOutputAmountForBuyMeme({
        inputAmount: inputAmount,
        slippagePercentage: 0,
      });
      console.log("getOutputAmountForBuyMeme: ", amount);
      // ).rejects.toThrow('Input amount must be a positive number');
    }, 150000);

    it("handles high slippage percentage for sellMeme", async () => {
      const poolAccountAddressId = new PublicKey("FrZBDKqxoNeyLYjLn2KM2nnVRWwpzZvM2i9kUx61xDVA");
      const boundPoolInstance = await BoundPoolClient.fromBoundPoolId({ client, poolAccountAddressId });

      const inputAmount = "567.023231";
      await expect(
        boundPoolInstance.getOutputAmountForSellMeme({
          inputAmount: inputAmount,
          slippagePercentage: 100,
        }),
      ).rejects.toThrow("Slippage percentage must be between 0 (inclusive) and 100 (exclusive).");

      await expect(
        boundPoolInstance.sellMeme({
          inputAmount: inputAmount,
          minOutputAmount: "5",
          slippagePercentage: 100,
          user: payer.publicKey,
          signer: payer,
        }),
      ).rejects.toThrow("Slippage percentage must be between 0 (inclusive) and 100 (exclusive).");
    }, 150000);

    it("too high slippage percentage for sellMeme", async () => {
      const poolAccountAddressId = new PublicKey("FrZBDKqxoNeyLYjLn2KM2nnVRWwpzZvM2i9kUx61xDVA");
      const boundPoolInstance = await BoundPoolClient.fromBoundPoolId({ client, poolAccountAddressId });

      const inputAmount = "567.023231";
      await expect(
        boundPoolInstance.getOutputAmountForSellMeme({
          inputAmount: inputAmount,
          slippagePercentage: 100,
        }),
      ).rejects.toThrow("Slippage percentage must be between 0 (inclusive) and 100 (exclusive).");

      await expect(
        boundPoolInstance.sellMeme({
          inputAmount: inputAmount,
          minOutputAmount: "5",
          slippagePercentage: 100,
          user: payer.publicKey,
          signer: payer,
        }),
      ).rejects.toThrow("Slippage percentage must be between 0 (inclusive) and 100 (exclusive).");
    }, 150000);

    it("handles high slippage percentage for sellMeme", async () => {
      const poolAccountAddressId = new PublicKey("FrZBDKqxoNeyLYjLn2KM2nnVRWwpzZvM2i9kUx61xDVA");
      const boundPoolInstance = await BoundPoolClient.fromBoundPoolId({ client, poolAccountAddressId });

      const inputAmount = "567.023231";
      const minOutputAmount = await boundPoolInstance.getOutputAmountForSellMeme({
        inputAmount: inputAmount,
        slippagePercentage: 99,
      });

      const res = await boundPoolInstance.sellMeme({
        inputAmount: inputAmount,
        minOutputAmount: minOutputAmount,
        slippagePercentage: 99,
        user: payer.publicKey,
        signer: payer,
      });

      expect(res).toBeDefined();
    }, 150000);
  });
});
