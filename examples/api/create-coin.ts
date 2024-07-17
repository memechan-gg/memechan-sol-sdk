import { Keypair } from "@solana/web3.js";
import { AuthApiInstance, TokenApiInstance } from "../common";
import nacl from "tweetnacl";

// yarn tsx examples/api/create-coin.ts
export const createCoinOnBEExample = async () => {
  const keypair = new Keypair();
  const messageToSign = await AuthApiInstance.requestMessageToSign(keypair.publicKey.toBase58());
  console.log("message to sign", messageToSign, keypair.publicKey.toBase58());
  const signature = nacl.sign.detached(Buffer.from(messageToSign), keypair.secretKey);
  await AuthApiInstance.refreshSession({
    walletAddress: keypair.publicKey.toBase58(),
    signedMessage: Buffer.from(signature).toString("hex"),
  });

  const signatures = ["2mDseATSMjDsxRMdqnEyhKwtYobuwtzgtY5uWJWFiTah7S1tUJaUjrqydHW6EtBJHhtaJkAgJxSazv9ohe8jfonr"];
  const socialLinks = { discord: "", telegram: "", twitter: "", website: "" };

  const res = await TokenApiInstance.createToken({
    txDigests: signatures,
    socialLinks: socialLinks,
  });

  console.debug("res: ", res);
};

createCoinOnBEExample();
