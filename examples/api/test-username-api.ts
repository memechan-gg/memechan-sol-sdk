import { Keypair } from "@solana/web3.js";
import { AuthApiInstance } from "../common";
import nacl from "tweetnacl";
import { BE_URL, UsernameAPI } from "../../src";

// yarn tsx examples/api/test-username-api.ts
export const testUsernameApi = async () => {
  // Create a new UsernameAPI instance
  const usernameAPI = new UsernameAPI();

  // Generate a keypair for testing
  const keypair = new Keypair();

  // Authenticate
  const messageToSign = await AuthApiInstance.requestMessageToSign(keypair.publicKey.toBase58());
  console.log("Message to sign:", messageToSign);
  console.log("Public key:", keypair.publicKey.toBase58());

  const signature = nacl.sign.detached(Buffer.from(messageToSign), keypair.secretKey);
  await AuthApiInstance.refreshSession({
    walletAddress: keypair.publicKey.toBase58(),
    signedMessage: Buffer.from(signature).toString("hex"),
  });

  console.log("BE URL", BE_URL);

  // Test setUsername
  const username = "testuser_" + Math.floor(Math.random() * 10000); // Generate a random username
  try {
    const setUsernameResult = await usernameAPI.setUsername(username);
    console.log("Set username result:", setUsernameResult);
  } catch (error) {
    console.error("Error setting username:", error);
  }

  // Test getWalletAddressForUsername
  try {
    const getWalletAddressResult = await usernameAPI.getWalletAddressForUsername(username);
    console.log("Get wallet address result:", getWalletAddressResult);

    // Verify that the returned wallet address matches the public key we used
    if (getWalletAddressResult.walletAddress === keypair.publicKey.toBase58()) {
      console.log("Wallet address verification successful!");
    } else {
      console.error("Wallet address verification failed!");
    }
  } catch (error) {
    console.error("Error getting wallet address:", error);
  }
};

testUsernameApi();
