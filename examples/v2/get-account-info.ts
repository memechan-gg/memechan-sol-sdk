import { PublicKey } from "@solana/web3.js";
import { createMemeChanClientV2 } from "../common";

// yarn tsx examples/v2/token-info/get-account-info.ts
(async () => {

  const clientV2 = await createMemeChanClientV2();
  const memeMint = new PublicKey("2Frbo28mMUYp3rNyuwA2cxyUPgZCEH8L41aRnyRjkHDi");
  const info = await clientV2.connection.getAccountInfo(memeMint);
  console.log(info);
})();
