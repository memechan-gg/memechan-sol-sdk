import { Keypair } from "@solana/web3.js";
import bs58 from "bs58";

// yarn tsx examples/wallet/convert-wallet-private-key.ts
(() => {
  const secretKey = bs58.decode("");
  console.log(`[${Keypair.fromSecretKey(secretKey).secretKey}]`);
})();
