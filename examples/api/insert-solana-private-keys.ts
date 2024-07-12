import { Keypair } from "@solana/web3.js";
import { AuthApiInstance, TokenApiInstance } from "../common";
import nacl from "tweetnacl";

// yarn tsx examples/api/insert-solana-private-keys.ts
export const insertPks = async () => {
  const keypair = new Keypair();
  const messageToSign = await AuthApiInstance.requestMessageToSign(keypair.publicKey.toBase58());
  console.log("message to sign", messageToSign, keypair.publicKey.toBase58());
  const signature = nacl.sign.detached(Buffer.from(messageToSign), keypair.secretKey);
  await AuthApiInstance.refreshSession({
    walletAddress: keypair.publicKey.toBase58(),
    signedMessage: Buffer.from(signature).toString("hex"),
  });

  const keypair1 = new Keypair();
  const kepyair2 = new Keypair();

  console.log("keypair1.secretKey.toString(), ", JSON.stringify(Array.from(keypair1.secretKey)));

  const res = await TokenApiInstance.insertPrivateKeys([
    { privateKey: JSON.stringify(Array.from(keypair1.secretKey)), publicKey: keypair1.publicKey.toBase58() },
    { privateKey: JSON.stringify(Array.from(kepyair2.secretKey)), publicKey: kepyair2.publicKey.toBase58() },
  ]);
  console.debug("res: ", res);
};

insertPks();
