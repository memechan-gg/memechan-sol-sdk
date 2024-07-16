import { PublicKey } from "@solana/web3.js";
import { AmmPool } from "../../../src/meteora/AmmPool";
import { BoundPoolClientV2, StakingPoolClientV2, getConfig, getTokenInfoByMint } from "../../../src";
import { createMemeChanClientV2, payer } from "../../common";

// yarn tsx examples/v2/live-pool/swap.ts
(async () => {
  const { default: AmmImpl } = await import("@mercurial-finance/dynamic-amm-sdk");
  const memeMint = new PublicKey("8NmKFkMehRoF9BLSajM9xioitxKWSfXTxw2qrtPtyE2z");
  const clientV2 = await createMemeChanClientV2();

  const stakingId = BoundPoolClientV2.findStakingPda(memeMint, clientV2.memechanProgram.programId);

  const stakingPool = await StakingPoolClientV2.fromStakingPoolId({
    client: clientV2,
    poolAccountAddressId: stakingId,
  });

  const memeTokenInfo = await getTokenInfoByMint(memeMint);

  console.log("memeTokenInfo: ", memeTokenInfo);
  console.log("memeTokenInfo.toSplTokenInfo(): ", memeTokenInfo.toSplTokenInfo());
  console.log(" stakingPool.poolObjectData.quoteAmmPool: ", stakingPool.poolObjectData.quoteAmmPool.toString());

  const { TOKEN_INFOS } = await getConfig();

  const ammImplQuote = await AmmImpl.create(
    clientV2.connection,
    stakingPool.poolObjectData.quoteAmmPool,
    memeTokenInfo.toSplTokenInfo(),
    TOKEN_INFOS.WSOL.toSplTokenInfo(),
  );

  const ammPool = new AmmPool(
    stakingPool.poolObjectData.quoteAmmPool,
    memeMint,
    stakingPool.poolObjectData.quoteMint,
    ammImplQuote,
  );

  await ammPool.swap(payer, 0.0001, 1, clientV2.connection);

  console.debug("swap finished");
})();
