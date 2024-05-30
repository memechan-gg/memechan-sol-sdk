import { BN } from "@coral-xyz/anchor";
import { BoundPoolClient } from "../src/bound-pool/BoundPoolClient";
import { sleep } from "../src/common/helpers";
import { DEFAULT_BOUND_POOL_WITH_BUY_MEME_ARGS, client, payer } from "./common/common";
import {
  MEMECHAN_MEME_TOKEN_DECIMALS,
  MEMECHAN_QUOTE_TOKEN,
  MEMECHAN_QUOTE_TOKEN_DECIMALS,
} from "../src/config/config";
import { MemeTicketClient } from "../src/memeticket/MemeTicketClient";
import { sendAndConfirmTransaction } from "@solana/web3.js";
import { getTokenBalanceForWallet } from "../src/util/getTokenAccountBalance";
import { normalizeInputCoinAmount } from "../src/util/trading/normalizeInputCoinAmount";
import { connection } from "../examples/common";

export function test() {
  describe("BoundPoolClient Trading", () => {
    it("buy meme tokens tx", async () => {
      const boundPoolInstance = await BoundPoolClient.newWithBuyTx(DEFAULT_BOUND_POOL_WITH_BUY_MEME_ARGS);
      const poolAccountAddressId = boundPoolInstance.id;
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

    it.skip("buy and sell meme tokens tx", async () => {
      const boundPoolInstance = await BoundPoolClient.newWithBuyTx(DEFAULT_BOUND_POOL_WITH_BUY_MEME_ARGS);
      console.log("==== pool id: " + boundPoolInstance.id.toString());

      // Step 1: Buy meme tokens
      const inputQuoteAmount = "2";
      const minMemeOutputAmount = await boundPoolInstance.getOutputAmountForBuyMeme({
        inputAmount: inputQuoteAmount,
        slippagePercentage: 0,
      });

      console.log("minMemeOutputAmount: ", minMemeOutputAmount);
      const { availableAmountWithDecimals: availableAmountWithDecimalsBeforeBuy } =
        await MemeTicketClient.fetchAvailableTicketsByUser(boundPoolInstance.id, client, payer.publicKey);

      console.log("availableAmountWithDecimalsBeforeBuy: ", availableAmountWithDecimalsBeforeBuy);

      const quoteTokenBalanceBeforeBuy = await getTokenBalanceForWallet(
        connection,
        payer.publicKey,
        MEMECHAN_QUOTE_TOKEN.mint,
      );
      console.log("quoteTokenBalanceBeforeBuy: ", quoteTokenBalanceBeforeBuy);

      const { tx: buyTx, memeTicketKeypair } = await boundPoolInstance.getBuyMemeTransaction({
        inputAmount: inputQuoteAmount,
        minOutputAmount: minMemeOutputAmount,
        slippagePercentage: 0,
        user: payer.publicKey,
      });

      const latestBlockhashBuy = await client.connection.getLatestBlockhash("confirmed");
      buyTx.recentBlockhash = latestBlockhashBuy.blockhash;
      buyTx.lastValidBlockHeight = latestBlockhashBuy.lastValidBlockHeight;

      const buySignature = await sendAndConfirmTransaction(client.connection, buyTx, [payer, memeTicketKeypair], {
        commitment: "confirmed",
        skipPreflight: true,
        preflightCommitment: "confirmed",
      });

      console.log("buySignature: " + buySignature);

      let retriesBuy = 5;
      let availableAmountWithDecimalsAfterBuy = "0";
      while (retriesBuy > 0) {
        const { availableAmountWithDecimals } = await MemeTicketClient.fetchAvailableTicketsByUser(
          boundPoolInstance.id,
          client,
          payer.publicKey,
        );
        if (availableAmountWithDecimals !== availableAmountWithDecimalsBeforeBuy) {
          availableAmountWithDecimalsAfterBuy = availableAmountWithDecimals;
          break;
        }
        console.log("Retrying to fetch updated state after buy...");
        await sleep(15000);
        retriesBuy--;
      }

      console.log("availableAmountWithDecimalsAfterBuy: ", availableAmountWithDecimalsAfterBuy);

      const quoteTokenBalanceAfterBuy = await getTokenBalanceForWallet(
        connection,
        payer.publicKey,
        MEMECHAN_QUOTE_TOKEN.mint,
      );
      console.log("quoteTokenBalanceAfterBuy: ", quoteTokenBalanceAfterBuy);

      const beforeBuyBN = new BN(
        normalizeInputCoinAmount(availableAmountWithDecimalsBeforeBuy, MEMECHAN_MEME_TOKEN_DECIMALS).toString(),
      );
      const afterBuyBN = new BN(
        normalizeInputCoinAmount(availableAmountWithDecimalsAfterBuy, MEMECHAN_MEME_TOKEN_DECIMALS).toString(),
      );
      const minMemeOutputAmountBuyBN = new BN(
        normalizeInputCoinAmount(minMemeOutputAmount, MEMECHAN_MEME_TOKEN_DECIMALS).toString(),
      );

      console.log("beforeBuyBN: ", beforeBuyBN.toString());
      console.log("afterBuyBN: ", afterBuyBN.toString());
      console.log("minMemeOutputAmountBuyBN: ", minMemeOutputAmountBuyBN.toString());
      console.log("afterBuyBN.sub(beforeBuyBN): ", afterBuyBN.sub(beforeBuyBN).toString());

      expect(afterBuyBN.sub(beforeBuyBN).gte(minMemeOutputAmountBuyBN)).toBeTruthy();

      // Step 2: Sell meme tokens

      // wait until ticket unlock
      await sleep(60000);

      const inputMemeAmount = availableAmountWithDecimalsAfterBuy;
      const minQuoteOutputAmount = await boundPoolInstance.getOutputAmountForSellMeme({
        inputAmount: inputMemeAmount,
        slippagePercentage: 0,
      });

      console.log("minQuoteOutputAmount: ", minQuoteOutputAmount);

      const quoteTokenBalanceBeforeSell = await getTokenBalanceForWallet(
        connection,
        payer.publicKey,
        MEMECHAN_QUOTE_TOKEN.mint,
      );
      console.log("quoteTokenBalanceBeforeSell: ", quoteTokenBalanceBeforeSell);

      const { txs: sellTxs } = await boundPoolInstance.getSellMemeTransaction({
        inputAmount: inputMemeAmount,
        minOutputAmount: minQuoteOutputAmount,
        slippagePercentage: 0,
        user: payer.publicKey,
      });

      for (const tx of sellTxs) {
        const latestBlockhashSell = await client.connection.getLatestBlockhash("confirmed");
        tx.recentBlockhash = latestBlockhashSell.blockhash;
        tx.lastValidBlockHeight = latestBlockhashSell.lastValidBlockHeight;

        const sellSignature = await sendAndConfirmTransaction(client.connection, tx, [payer], {
          commitment: "confirmed",
          skipPreflight: true,
          preflightCommitment: "confirmed",
        });

        console.log("sellSignature: " + sellSignature);
      }

      let retriesSell = 5;
      let quoteTokenBalanceAfterSell = "0";
      while (retriesSell > 0) {
        const balance = await getTokenBalanceForWallet(connection, payer.publicKey, MEMECHAN_QUOTE_TOKEN.mint);
        if (balance !== quoteTokenBalanceBeforeSell) {
          quoteTokenBalanceAfterSell = balance;
          break;
        }
        console.log("Retrying to fetch updated state after sell...");
        await sleep(15000);
        retriesSell--;
      }

      console.log("quoteTokenBalanceAfterSell: ", quoteTokenBalanceAfterSell);

      const beforeSellBN = new BN(
        normalizeInputCoinAmount(quoteTokenBalanceBeforeSell, MEMECHAN_QUOTE_TOKEN_DECIMALS).toString(),
      );
      const afterSellBN = new BN(
        normalizeInputCoinAmount(quoteTokenBalanceAfterSell, MEMECHAN_QUOTE_TOKEN_DECIMALS).toString(),
      );
      const minQuoteOutputAmountBN = new BN(
        normalizeInputCoinAmount(minQuoteOutputAmount, MEMECHAN_QUOTE_TOKEN_DECIMALS).toString(),
      );

      console.log("beforeSellBN: ", beforeSellBN.toString());
      console.log("afterSellBN: ", afterSellBN.toString());
      console.log("minQuoteOutputAmountBN: ", minQuoteOutputAmountBN.toString());

      expect(afterSellBN.sub(beforeSellBN).gte(minQuoteOutputAmountBN)).toBeTruthy();
    }, 150000);

    describe("Edge Cases", () => {
      it("handles zero input amount for sellMeme", async () => {
        const boundPoolInstance = await BoundPoolClient.newWithBuyTx(DEFAULT_BOUND_POOL_WITH_BUY_MEME_ARGS);

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
        const boundPoolInstance = await BoundPoolClient.newWithBuyTx(DEFAULT_BOUND_POOL_WITH_BUY_MEME_ARGS);

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
        const boundPoolInstance = await BoundPoolClient.newWithBuyTx(DEFAULT_BOUND_POOL_WITH_BUY_MEME_ARGS);

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
        const boundPoolInstance = await BoundPoolClient.newWithBuyTx(DEFAULT_BOUND_POOL_WITH_BUY_MEME_ARGS);

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
        const boundPoolInstance = await BoundPoolClient.newWithBuyTx(DEFAULT_BOUND_POOL_WITH_BUY_MEME_ARGS);
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
}
