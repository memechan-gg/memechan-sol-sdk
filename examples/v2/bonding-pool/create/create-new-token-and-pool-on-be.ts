import { Keypair } from "@solana/web3.js";
import { admin, payer, DUMMY_TOKEN_METADATA, TokenApiInstance, AuthApiInstance } from "../../../common";
import { TOKEN_INFOS } from "../../../../src";
import { MemeTicketClientV2 } from "../../../../src/memeticket/MemeTicketClientV2";
import nacl from "tweetnacl";

// yarn tsx examples/v2/bonding-pool/create/create-new-token-and-pool-on-be.ts > log.txt 2>&1
export const createNewTokenAndPoolOnBe = async () => {
  const keypair = new Keypair();
  const messageToSign = await AuthApiInstance.requestMessageToSign(keypair.publicKey.toBase58());
  console.log("message to sign", messageToSign, keypair.publicKey.toBase58());
  const signature = nacl.sign.detached(Buffer.from(messageToSign), keypair.secretKey);
  await AuthApiInstance.refreshSession({
    walletAddress: keypair.publicKey.toBase58(),
    signedMessage: Buffer.from(signature).toString("hex"),
  });

  const res = await TokenApiInstance.createBoundPool({
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
};

createNewTokenAndPoolOnBe();
