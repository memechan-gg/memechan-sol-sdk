import { sendAndConfirmTransaction } from "@solana/web3.js";
import { BoundPoolClient } from "../../../src/bound-pool/BoundPool";
import { MEMECHAN_QUOTE_TOKEN } from "../../../src/config/config";
import { admin, payer, client, DUMMY_TOKEN_METADATA } from "../../common";
import { getTxSize } from "../../../src/util/get-tx-size";

// yarn tsx examples/bonding-pool/create/create-new-token-and-pool-tx.ts > log.txt 2>&1
export const createNewTokenAndPoolTx = async () => {
  const { transaction, memeMintKeypair, poolQuoteVaultId, launchVaultId } =
    await BoundPoolClient.getCreateNewBondingPoolAndTokenTransaction({
      admin,
      payer: payer.publicKey,
      client,
      quoteToken: MEMECHAN_QUOTE_TOKEN,
      tokenMetadata: DUMMY_TOKEN_METADATA,
    });

  const memeMint = memeMintKeypair.publicKey;

  try {
    const size = getTxSize(transaction, payer.publicKey);
    console.debug("createPoolAndTokenSignature size: ", size);

    const createPoolAndTokenSignature = await sendAndConfirmTransaction(
      client.connection,
      transaction,
      [payer, memeMintKeypair, poolQuoteVaultId, launchVaultId],
      {
        commitment: "confirmed",
        skipPreflight: true,
      },
    );
    console.log("createPoolAndTokenSignature:", createPoolAndTokenSignature);

    const id = BoundPoolClient.findBoundPoolPda(memeMint, MEMECHAN_QUOTE_TOKEN.mint, client.memechanProgram.programId);
    console.debug("id: ", id);
    const boundPool = await BoundPoolClient.fetch2(client.connection, id);
    console.log("boundPool:", boundPool);
  } catch (e) {
    console.error(e);
  }
};

createNewTokenAndPoolTx();
