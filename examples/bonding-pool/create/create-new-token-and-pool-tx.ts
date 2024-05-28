import { sendAndConfirmTransaction } from "@solana/web3.js";
import { BoundPoolClient } from "../../../src/bound-pool/BoundPoolClient";
import { MEMECHAN_QUOTE_TOKEN } from "../../../src/config/config";
import { admin, payer, client, DUMMY_TOKEN_METADATA } from "../../common";
import { getTxSize } from "../../../src/util/get-tx-size";

// yarn tsx examples/bonding-pool/create/create-new-token-and-pool-tx.ts > log.txt 2>&1
export const createNewTokenAndPoolTx = async () => {
  const { createPoolTransaction, createTokenTransaction, memeMintKeypair } =
    await BoundPoolClient.getCreateNewBondingPoolAndTokenTransaction({
      admin,
      payer: payer.publicKey,
      client,
      quoteToken: MEMECHAN_QUOTE_TOKEN,
      tokenMetadata: DUMMY_TOKEN_METADATA,
    });

  const memeMint = memeMintKeypair.publicKey;

  try {
    const createPoolTransactionSize = getTxSize(createPoolTransaction, payer.publicKey);
    console.debug("createPoolTransaction size: ", createPoolTransactionSize);

    const createTokenTransactionSize = getTxSize(createTokenTransaction, payer.publicKey);
    console.debug("createTokenTransaction size: ", createTokenTransactionSize);

    const createPoolSignature = await sendAndConfirmTransaction(
      client.connection,
      createPoolTransaction,
      [payer, memeMintKeypair],
      {
        commitment: "confirmed",
        skipPreflight: true,
        preflightCommitment: "confirmed",
      },
    );
    console.log("createPoolSignature:", createPoolSignature);

    const createTokenSignature = await sendAndConfirmTransaction(client.connection, createTokenTransaction, [payer], {
      commitment: "confirmed",
      skipPreflight: true,
      preflightCommitment: "confirmed",
    });
    console.log("createTokenSignature:", createTokenSignature);

    const id = BoundPoolClient.findBoundPoolPda(memeMint, MEMECHAN_QUOTE_TOKEN.mint, client.memechanProgram.programId);
    console.debug("id: ", id);
    const boundPool = await BoundPoolClient.fetch2(client.connection, id);
    console.log("boundPool:", boundPool);
  } catch (e) {
    console.error(e);
  }
};

createNewTokenAndPoolTx();
