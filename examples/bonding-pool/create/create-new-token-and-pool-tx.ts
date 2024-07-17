import { sendAndConfirmTransaction } from "@solana/web3.js";
import { BoundPoolClient } from "../../../src/bound-pool/BoundPoolClient";
import { admin, payer, client, DUMMY_TOKEN_METADATA } from "../../common";
import { getTxSize } from "../../../src/util/get-tx-size";
import { MemeTicketClient, TOKEN_INFOS, sleep } from "../../../src";

// yarn tsx examples/bonding-pool/create/create-new-token-and-pool-tx.ts > log.txt 2>&1
export const createNewTokenAndPoolTx = async () => {
  const { createPoolTransaction, memeMintKeypair } =
    await BoundPoolClient.getCreateNewBondingPoolAndBuyAndTokenWithBuyMemeTransaction({
      admin,
      payer: payer.publicKey,
      client,
      quoteToken: TOKEN_INFOS.WSOL,
      tokenMetadata: DUMMY_TOKEN_METADATA,
      buyMemeTransactionArgs: {
        inputAmount: "0.001",
        minOutputAmount: "1",
        slippagePercentage: 0,
        user: payer.publicKey,
        memeTicketNumber: MemeTicketClient.TICKET_NUMBER_START,
      },
    });

  const memeMint = memeMintKeypair.publicKey;

  try {
    const createPoolTransactionSize = getTxSize(createPoolTransaction, payer.publicKey);
    console.debug("createPoolTransaction size: ", createPoolTransactionSize);

    // const createTokenTransactionSize = getTxSize(createTokenTransaction, payer.publicKey);
    // console.debug("createTokenTransaction size: ", createTokenTransactionSize);

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

    sleep(5000);

    const id = BoundPoolClient.findBoundPoolPda(memeMint, TOKEN_INFOS.WSOL.mint, client.memechanProgram.programId);
    console.debug("id: ", id);
    const boundPool = await BoundPoolClient.fetch2(client.connection, id);
    console.log("boundPool:", boundPool);
  } catch (e) {
    console.error(e);
  }
};

createNewTokenAndPoolTx();
