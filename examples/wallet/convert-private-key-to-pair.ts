/* eslint-disable max-len */
import { Keypair } from "@solana/web3.js";
// import bs58 from "bs58";

// yarn tsx examples/wallet/convert-private-key-to-pair.ts

const privateKeysInput: string[] = [
  "[10,176,218,138,165,186,156,227,35,245,97,44,240,32,87,72,160,231,67,158,94,131,242,118,198,88,237,232,178,120,240,11,74,12,155,213,247,118,232,171,114,138,201,153,144,234,151,49,115,114,226,75,82,44,191,204,182,41,225,136,35,137,135,241]",
  "[81,78,184,167,89,4,16,157,247,224,141,71,36,9,231,231,114,59,154,20,246,183,137,88,134,26,32,59,155,62,33,95,172,195,238,61,21,216,59,103,158,218,37,173,36,67,39,211,139,250,72,204,215,16,75,33,51,66,4,60,85,219,18,160]",
  "[141,16,114,195,2,18,35,21,1,28,135,132,173,251,169,162,97,191,43,108,76,229,178,242,234,110,110,182,24,228,90,56,187,213,182,26,210,198,1,183,4,114,21,242,161,142,212,9,234,194,173,138,157,181,174,11,54,254,12,112,73,39,68,98]"
];

// Function to convert a private key string to a Keypair and output the public-private key pair
function convertPrivateKeyToPublicPrivatePair(privateKeyString: string): string {
  // Convert string to array of numbers
  const privateKeyArray = JSON.parse(privateKeyString) as number[];
  const secretKey = Uint8Array.from(privateKeyArray);
  const keypair = Keypair.fromSecretKey(secretKey);
  const publicKey = keypair.publicKey.toString();
  // const privateKey = bs58.encode(secretKey);
  return `${publicKey};${secretKey}`;
}

// Process all private keys and print the results
privateKeysInput.forEach((privateKeyString) => {
  const result = convertPrivateKeyToPublicPrivatePair(privateKeyString);
  console.log(result);
});
