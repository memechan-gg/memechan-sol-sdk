import { Keypair } from "@solana/web3.js";
import bs58 from "bs58";

// yarn tsx examples/wallet/convert-wallet-private-key.ts
(() => {
  const secretKey = "[51,151,38,41,98,165,167,117,3,188,149,57,21,242,202,211,43,253,134,147,47,11,85,163,187,195,63,190,209,100,193,133,96,166,117,110,128,81,1,130,209,141,250,132,154,247,67,200,83,136,137,101,248,237,155,26,79,42,52,8,65,157,231,151]";
  console.log(`[${Keypair.fromSecretKey(Uint8Array.from(JSON.parse(secretKey))).publicKey.toBase58()}]`);

  console.log(`[${bs58.encode(Uint8Array.from(JSON.parse(secretKey)))}]`);

  const result =  [51,151,38,41,98,165,167,117,3,188,149,57,21,242,202,211,43,253,134,147,47,11,85,163,187,195,63,190,209,100,193,133,96,166,117,110,128,81,1,130,209,141,250,132,154,247,67,200,83,136,137,101,248,237,155,26,79,42,52,8,65,157,231,151].map(byte => byte.toString(16).padStart(2, '0')).join('')
  console.log(result);
})();
