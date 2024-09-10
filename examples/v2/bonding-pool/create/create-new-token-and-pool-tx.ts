import { sendAndConfirmTransaction } from "@solana/web3.js";
import { admin, payer, DUMMY_TOKEN_METADATA, clientV2 } from "../../../common";
import { getTxSize } from "../../../../src/util/get-tx-size";
import { TOKEN_INFOS, sleep } from "../../../../src";
import { BoundPoolClientV2 } from "../../../../src/bound-pool/BoundPoolClientV2";
import { MemeTicketClientV2 } from "../../../../src/memeticket/MemeTicketClientV2";

// yarn tsx examples/v2/bonding-pool/create/create-new-token-and-pool-tx.ts > log.txt 2>&1
export const createNewTokenAndPoolTx = async () => {
  const { createPoolTransaction, memeMintKeypair } =
    await BoundPoolClientV2.getCreateNewBondingPoolAndBuyAndTokenWithBuyMemeTransaction({
      admin,
      payer: payer.publicKey,
      client: clientV2,
      quoteToken: TOKEN_INFOS.WSOL,
      tokenMetadata: DUMMY_TOKEN_METADATA,
      buyMemeTransactionArgs: {
        inputAmount: "0.001",
        minOutputAmount: "1",
        slippagePercentage: 0,
        user: payer.publicKey,
        memeTicketNumber: MemeTicketClientV2.TICKET_NUMBER_START,
      },
      topHolderFeeBps: 0,
    });

  const memeMint = memeMintKeypair.publicKey;

  try {
    const createPoolTransactionSize = getTxSize(createPoolTransaction, payer.publicKey);
    console.debug("createPoolTransaction size: ", createPoolTransactionSize);

    const createPoolSignature = await sendAndConfirmTransaction(
      clientV2.connection,
      createPoolTransaction,
      [payer, memeMintKeypair],
      {
        commitment: "confirmed",
        skipPreflight: true,
        preflightCommitment: "confirmed",
      },
    );
    console.log("createPoolSignature:", createPoolSignature);

    await sleep(5000);

    const id = BoundPoolClientV2.findBoundPoolPda(memeMint, TOKEN_INFOS.WSOL.mint, clientV2.memechanProgram.programId);
    console.debug("id: ", id);
    const boundPool = await BoundPoolClientV2.fetch2(clientV2.connection, id);
    console.log("boundPool:", boundPool);
  } catch (e) {
    console.error(e);
  }
};

createNewTokenAndPoolTx();
