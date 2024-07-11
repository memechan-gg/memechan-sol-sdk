import { Keypair } from "@solana/web3.js";
import { admin, AuthApiInstance, DUMMY_TOKEN_METADATA, payer, TokenApiInstance } from "../common";
import nacl from "tweetnacl";
import { TOKEN_INFOS, MemeTicketClientV2 } from "../../src";

// yarn tsx examples/api/create-bound-pool-tx.ts
export const createBoundPoolTransaction = async () => {
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
  console.debug("res: ", res);
};

createBoundPoolTransaction();
