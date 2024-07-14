import { PublicKey } from "@solana/web3.js";
import { BoundPoolClientV2, MEMECHAN_PROGRAM_ID_V2_PK, TOKEN_INFOS } from "../../../../src";
import { clientV2 } from "../../../common";

// yarn tsx examples/v2/bonding-pool/from/bound-pool-from-meme-mint.ts
(async () => {
  const memeMint = new PublicKey("dLHm1TA37LRj4bnXEJqxdYETVCQeAk3WGdKpWEcchan");
  const boundPoolPda = BoundPoolClientV2.findBoundPoolPda(memeMint, TOKEN_INFOS.WSOL.mint, MEMECHAN_PROGRAM_ID_V2_PK);

  console.debug("boundPoolPda: ", boundPoolPda);

  const instance = await BoundPoolClientV2.fromBoundPoolId({ client: clientV2, poolAccountAddressId: boundPoolPda });
  console.debug("instance: ", instance.id.toString());
})();
