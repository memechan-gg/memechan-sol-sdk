import { Connection, Keypair, PublicKey, Transaction, TransactionMessage, VersionedTransaction } from "@solana/web3.js";
import { admin, payer, DUMMY_TOKEN_METADATA, clientV2, connection } from "../../../common";
import { getTxSize } from "../../../../src/util/get-tx-size";
import { TOKEN_INFOS, sleep } from "../../../../src";
import { BoundPoolClientV2 } from "../../../../src/bound-pool/BoundPoolClientV2";
import { MemeTicketClientV2 } from "../../../../src/memeticket/MemeTicketClientV2";

// yarn tsx examples/v2/bonding-pool/create/create-new-token-and-pool-from-be-tx.ts > log.txt 2>&1
export const createNewTokenAndPoolTx = async () => {
  const vanityMemeMintKeypair = Keypair.generate();
  console.log("vanityMemeMintKeypair:", vanityMemeMintKeypair.publicKey.toBase58());

  const { createPoolTransaction: originalCreatePoolTransaction, memeMintKeypair } =
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
      memeMintKeypair: vanityMemeMintKeypair,
    });

  const memeMint = memeMintKeypair.publicKey;

  // simulate BE call now
  const serializedTx = await signCreatePoolTxBE(
    payer.publicKey,
    memeMintKeypair,
    originalCreatePoolTransaction,
    clientV2.connection,
  );

  if (!serializedTx) {
    console.error("Failed to serialize transaction");
    return;
  }

  const createPoolTransaction = VersionedTransaction.deserialize(serializedTx);

  try {
    const createPoolTransactionSize = serializedTx.length;
    console.debug("createPoolTransaction size: ", createPoolTransactionSize);

    createPoolTransaction.sign([payer]);

    const createPoolSignature = await connection.sendTransaction(createPoolTransaction);
    console.log("createPoolSignature:", createPoolSignature);

    sleep(15000);

    const id = BoundPoolClientV2.findBoundPoolPda(memeMint, TOKEN_INFOS.WSOL.mint, clientV2.memechanProgram.programId);
    console.debug("id: ", id);
    const boundPool = await BoundPoolClientV2.fetch2(clientV2.connection, id);
    console.log("boundPool:", boundPool);
  } catch (e) {
    console.error(e);
  }
};

const signCreatePoolTxBE = async (
  user: PublicKey,
  memeMintKeypair: Keypair,
  createPoolTransaction: Transaction,
  connection: Connection,
) => {
  try {
    const userPubkey = user;
    const createPoolTransactionSize = getTxSize(createPoolTransaction, payer.publicKey);
    console.debug("createPoolTransaction size: ", createPoolTransactionSize);

    const txm = new TransactionMessage({
      payerKey: userPubkey,
      recentBlockhash: (await connection.getLatestBlockhash()).blockhash,
      instructions: createPoolTransaction.instructions,
    });
    const vtx = new VersionedTransaction(txm.compileToV0Message());
    vtx.sign([memeMintKeypair]);
    return vtx.serialize();
  } catch (e) {
    console.error("signCreatePoolTxBE", e);
  }

  return undefined;
};

createNewTokenAndPoolTx();
