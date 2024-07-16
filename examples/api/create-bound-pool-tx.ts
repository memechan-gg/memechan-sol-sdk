import { Keypair } from "@solana/web3.js";
import { DUMMY_TOKEN_METADATA, payer } from "../common";
import nacl from "tweetnacl";
import { Auth, getConfig, MemeTicketClientV2, TokenAPI } from "../../src";

// yarn tsx examples/api/create-bound-pool-tx.ts
export const createBoundPoolTransaction = async () => {
  const keypair = new Keypair();

  const { BE_URL, ADMIN_PUB_KEY, TOKEN_INFOS } = await getConfig();

  const authApiInstance = new Auth(BE_URL);
  const tokenApiInstance = new TokenAPI(BE_URL);
  const messageToSign = await authApiInstance.requestMessageToSign(keypair.publicKey.toBase58());
  console.log("message to sign", messageToSign, keypair.publicKey.toBase58());
  const signature = nacl.sign.detached(Buffer.from(messageToSign), keypair.secretKey);
  await authApiInstance.refreshSession({
    walletAddress: keypair.publicKey.toBase58(),
    signedMessage: Buffer.from(signature).toString("hex"),
  });

  const res = await tokenApiInstance.createBoundPoolTransaction({
    admin: ADMIN_PUB_KEY.toBase58(),
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
