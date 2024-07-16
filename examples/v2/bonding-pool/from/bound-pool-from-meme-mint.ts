import { PublicKey } from "@solana/web3.js";
import { BoundPoolClientV2, getConfig } from "../../../../src";
import { createMemeChanClientV2 } from "../../../common";

// yarn tsx examples/v2/bonding-pool/from/bound-pool-from-meme-mint.ts
(async () => {
  const memeMint = new PublicKey("RYP98LRpC6x3KKRX5FZqxbFp2S6sg2KBLU3s6wJchan");
  const { TOKEN_INFOS, MEMECHAN_PROGRAM_ID_V2_PK } = await getConfig();

  const boundPoolPda = BoundPoolClientV2.findBoundPoolPda(memeMint, TOKEN_INFOS.WSOL.mint, MEMECHAN_PROGRAM_ID_V2_PK);

  console.debug("boundPoolPda: ", boundPoolPda);

  const clientV2 = await createMemeChanClientV2();

  const instance = await BoundPoolClientV2.fromBoundPoolId({ client: clientV2, poolAccountAddressId: boundPoolPda });
  console.debug("instance: ", instance.id.toString());
})();
