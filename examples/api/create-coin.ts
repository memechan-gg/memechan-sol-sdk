import { Keypair } from "@solana/web3.js";
import nacl from "tweetnacl";
import { getConfig, Auth, TokenAPI } from "../../src";

// yarn tsx examples/api/create-coin.ts
export const createCoinOnBEExample = async () => {
  const keypair = new Keypair();

  const { BE_URL } = await getConfig();
  const authApiInstance = new Auth(BE_URL);
  const tokenApiInstance = new TokenAPI(BE_URL);

  const messageToSign = await authApiInstance.requestMessageToSign(keypair.publicKey.toBase58());
  console.log("message to sign", messageToSign, keypair.publicKey.toBase58());
  const signature = nacl.sign.detached(Buffer.from(messageToSign), keypair.secretKey);
  await authApiInstance.refreshSession({
    walletAddress: keypair.publicKey.toBase58(),
    signedMessage: Buffer.from(signature).toString("hex"),
  });

  const signatures = ["2mDseATSMjDsxRMdqnEyhKwtYobuwtzgtY5uWJWFiTah7S1tUJaUjrqydHW6EtBJHhtaJkAgJxSazv9ohe8jfonr"];
  const socialLinks = { discord: "", telegram: "", twitter: "", website: "" };

  const res = await tokenApiInstance.createToken({
    txDigests: signatures,
    socialLinks: socialLinks,
  });

  console.debug("res: ", res);
};

createCoinOnBEExample();
