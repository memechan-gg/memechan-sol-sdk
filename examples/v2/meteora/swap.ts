import { PublicKey } from "@solana/web3.js";
import { AmmPool } from "../../../src/meteora/AmmPool";
import { BoundPoolClientV2, MEME_TOKEN_DECIMALS, StakingPoolClientV2, TOKEN_INFOS, TokenInfo } from "../../../src";
import { clientV2, payer } from "../../common";

// yarn tsx examples/v2/meteora/swap.ts
(async () => {
  const memeMint = new PublicKey("8yj642xHs8EePZBccgrCifoitmoKdwiZPVGovfVvezr5");
  const stakingId = BoundPoolClientV2.findStakingPda(memeMint, clientV2.memechanProgram.programId);

  const stakingPool = await StakingPoolClientV2.fromStakingPoolId({
    client: clientV2,
    poolAccountAddressId: stakingId,
  });

  const { NATIVE_MINT } = await import("@solana/spl-token");

  const memeTokenInfo = new TokenInfo({
    decimals: MEME_TOKEN_DECIMALS,
    mint: new PublicKey(stakingPool.memeMint),
    name: "MEME",
    programId: clientV2.memechanProgram.programId,
    symbol: "MEME",
    targetConfig: NATIVE_MINT,
    targetConfigV2: NATIVE_MINT,
  });

  const { default: AmmImpl } = await import("@mercurial-finance/dynamic-amm-sdk");

  const ammImplQuote = await AmmImpl.create(
    clientV2.connection,
    stakingPool.poolObjectData.quoteAmmPool,
    memeTokenInfo.toSplTokenInfo(),
    TOKEN_INFOS.WSOL.toSplTokenInfo(),
  );

  const ammPool = new AmmPool(
    stakingPool.poolObjectData.chanAmmPool,
    memeMint,
    stakingPool.poolObjectData.quoteMint,
    ammImplQuote,
  );

  await ammPool.swap(payer, 0.0001, 1, clientV2.connection);

  console.debug("swap finished");
})();
