import nacl from "tweetnacl";
import { BE_URL } from "./utils";
import { Keypair } from "@solana/web3.js";
import { Auth } from "../src/api/auth/Auth";

describe("AuthService", () => {
  test("check that the authentication flow is working properly", async () => {
    const authService = new Auth(BE_URL);
    const keypair = new Keypair();
    const messageToSign = await authService.requestMessageToSign(keypair.publicKey.toBase58());
    console.log("message to sign", messageToSign, keypair.publicKey.toBase58());
    const signature = nacl.sign.detached(Buffer.from(messageToSign), keypair.secretKey);
    const result = await authService.refreshSession({
      walletAddress: keypair.publicKey.toBase58(),
      signedMessage: Buffer.from(signature).toString("hex"),
    });
    console.log(result);
  });
});
