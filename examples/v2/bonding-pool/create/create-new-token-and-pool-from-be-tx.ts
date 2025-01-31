import { Keypair, PublicKey, VersionedTransaction } from "@solana/web3.js";
import {
  admin,
  payer,
  DUMMY_TOKEN_METADATA,
  clientV2,
  connection,
  TokenApiInstance,
  AuthApiInstance,
} from "../../../common";
import { TOKEN_INFOS, sleep } from "../../../../src";
import { BoundPoolClientV2 } from "../../../../src/bound-pool/BoundPoolClientV2";
import { MemeTicketClientV2 } from "../../../../src/memeticket/MemeTicketClientV2";
import nacl from "tweetnacl";

// yarn tsx examples/v2/bonding-pool/create/create-new-token-and-pool-from-be-tx.ts > log.txt 2>&1
export const createNewTokenAndPoolFromBeTx = async () => {
  const keypair = new Keypair();
  const messageToSign = await AuthApiInstance.requestMessageToSign(keypair.publicKey.toBase58());
  console.log("message to sign", messageToSign, keypair.publicKey.toBase58());
  const signature = nacl.sign.detached(Buffer.from(messageToSign), keypair.secretKey);
  await AuthApiInstance.refreshSession({
    walletAddress: keypair.publicKey.toBase58(),
    signedMessage: Buffer.from(signature).toString("hex"),
  });

  const res = await TokenApiInstance.createBoundPoolTransaction({
    admin: admin.toBase58(),
    payer: payer.publicKey.toBase58(),
    quoteToken: TOKEN_INFOS.WSOL,
    tokenMetadata: DUMMY_TOKEN_METADATA,
    buyMemeTransactionArgs: {
      inputAmount: "0.001",
      minOutputAmount: "1",
      slippagePercentage: 0,
      user: payer.publicKey.toBase58(),
      memeTicketNumber: MemeTicketClientV2.TICKET_NUMBER_START,
    },
  });

  console.log("res: ", res);

  const buffer = Buffer.from(res.serializedTransactionBase64, "base64");
  const createPoolTransaction = VersionedTransaction.deserialize(buffer);

  console.log("createPoolTransaction:", createPoolTransaction);

  try {
    createPoolTransaction.sign([payer]);

    const createPoolSignature = await connection.sendTransaction(createPoolTransaction);
    console.log("createPoolSignature:", createPoolSignature);

    await sleep(15000);

    const id = BoundPoolClientV2.findBoundPoolPda(
      new PublicKey(res.memeMint),
      TOKEN_INFOS.WSOL.mint,
      clientV2.memechanProgram.programId,
    );
    console.debug("id: ", id);
    const boundPool = await BoundPoolClientV2.fetch2(clientV2.connection, id);
    console.log("boundPool:", boundPool);
  } catch (e) {
    console.error(e);
  }
};

createNewTokenAndPoolFromBeTx();
