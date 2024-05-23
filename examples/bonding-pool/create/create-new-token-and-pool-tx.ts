import { Transaction, sendAndConfirmTransaction } from "@solana/web3.js";
import { BoundPoolClient } from "../../../src/bound-pool/BoundPool";
import { MEMECHAN_QUOTE_TOKEN } from "../../../src/config/config";
import { admin, payer, client } from "../../common";
import { getTxSize } from "../../../src/util/get-tx-size";

const DUMMY_TOKEN_METADATA = {
  name: "Best Token Ever",
  symbol: "BTE",
  image: "https://cf-ipfs.com/ipfs/QmVevMfxFpfgBu5kHuYUPmDMaV6pWkAn3zw5XaCXxKdaBh",
  description: "This is the best token ever",
  twitter: "https://twitter.com/BestTokenEver",
  telegram: "https://t.me/BestTokenEver",
  website: "https://besttokenever.com",
};

// yarn tsx examples/bonding-pool/create/create-new-token-and-pool-tx.ts > log.txt 2>&1
export const createNewTokenAndPoolTx = async () => {
  const { createPoolTransaction, createTokenTransaction, memeMintKeypair, poolQuoteVaultId, launchVaultId } =
    await BoundPoolClient.getCreateNewBondingPoolAndTokenTransaction({
      admin,
      payer,
      signer: payer,
      client,
      quoteToken: MEMECHAN_QUOTE_TOKEN,
      tokenMetadata: DUMMY_TOKEN_METADATA,
    });

  const memeMint = memeMintKeypair.publicKey;

  try {
    const transaction = new Transaction().add(
      ...createPoolTransaction.instructions,
      ...createTokenTransaction.instructions,
    );

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
