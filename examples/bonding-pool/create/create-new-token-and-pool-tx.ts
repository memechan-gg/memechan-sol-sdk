import { sendAndConfirmTransaction } from "@solana/web3.js";
import { BoundPoolClient } from "../../../src/bound-pool/BoundPool";
import { MEMECHAN_QUOTE_TOKEN } from "../../../src/config/config";
import { admin, payer, client } from "../../common";

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
      payer: payer.publicKey,
      signer: payer,
      client,
      quoteToken: MEMECHAN_QUOTE_TOKEN,
      tokenMetadata: DUMMY_TOKEN_METADATA,
    });

  const memeMint = memeMintKeypair.publicKey;

  try {
    const createPoolSignature = await sendAndConfirmTransaction(
      client.connection,
      createPoolTransaction,
      [payer, memeMintKeypair, poolQuoteVaultId, launchVaultId],
      {
        commitment: "confirmed",
        // skipPreflight: true,
      },
    );
    console.log("createPoolSignature:", createPoolSignature);

    const createTokenSignature = await sendAndConfirmTransaction(client.connection, createTokenTransaction, [payer], {
      commitment: "confirmed",
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
