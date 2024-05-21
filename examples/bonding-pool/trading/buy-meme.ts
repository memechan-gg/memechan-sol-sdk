import { PublicKey } from "@solana/web3.js";
import { BoundPoolClient } from "../../../src/bound-pool/BoundPool";
import { client } from "../../common";

// yarn tsx examples/bonding-pool/trading/buy-meme.ts
(async () => {
  const poolAccountAddressId = new PublicKey("9pF4n8h8r4hDZftZffoHfvEaox9aZCqh3n4WTCXS5HCE");
  const boundPoolInstance = await BoundPoolClient.fromBoundPoolId({ client, poolAccountAddressId });

  console.debug("boundPoolInstance: ", boundPoolInstance);
})();
