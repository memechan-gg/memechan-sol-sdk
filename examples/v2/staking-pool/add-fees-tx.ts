import { clientV2, connection, payer } from "./../../common";
import { StakingPool as CodegenStakingPool } from "../../../src/schema/v2/codegen/accounts/StakingPool";
import { BoundPoolClientV2, MEME_TOKEN_DECIMALS, StakingPoolClientV2, TOKEN_INFOS, TokenInfo } from "../../../src";
import { PublicKey } from "@solana/web3.js";
import { AmmPool } from "../../../src/meteora/AmmPool";
import AmmImpl from "@mercurial-finance/dynamic-amm-sdk";
import { NATIVE_MINT } from "@memechan/spl-token";

// yarn tsx examples/v2/staking-pool/add-fees-tx.ts > add-fees-tx.txt 2>&1
export const addFeesTx = async () => {
  // Get staking pool
  const memeMint = new PublicKey("G6wyDdcDn6pJuPbferviyZh6JFgxDoyasYX8MsorJPoK");
  const stakingPoolAddress = BoundPoolClientV2.findStakingPda(memeMint, clientV2.memechanProgram.programId);

  const stakingPool = await StakingPoolClientV2.fromStakingPoolId({
    client: clientV2,
    poolAccountAddressId: stakingPoolAddress,
  });
  const fetchedStakingPool = await CodegenStakingPool.fetch(connection, stakingPoolAddress);
  console.log("fetchedStakingPool:", fetchedStakingPool?.toJSON());

  const memeTokenInfo = new TokenInfo({
    decimals: MEME_TOKEN_DECIMALS,
    mint: stakingPool.memeMint,
    name: "MEME",
    programId: clientV2.memechanProgram.programId,
    symbol: "MEME",
    targetConfig: NATIVE_MINT,
    targetConfigV2: NATIVE_MINT,
  });

  const ammImplQuote = await AmmImpl.create(
    connection,
    stakingPool.poolObjectData.quoteAmmPool,
    memeTokenInfo.toSplTokenInfo(),
    TOKEN_INFOS.WSOL.toSplTokenInfo(),
  );

  const quoteAmmPool = new AmmPool(
    stakingPool.poolObjectData.quoteAmmPool,
    stakingPool.poolObjectData.memeMint,
    stakingPool.poolObjectData.quoteMint,
    ammImplQuote,
  );

  await stakingPool.addFeesToAmmPool(quoteAmmPool, stakingPool, memeTokenInfo, TOKEN_INFOS.WSOL, clientV2, payer);

  // CHAN
  const ammImplChan = await AmmImpl.create(
    connection,
    stakingPool.poolObjectData.chanAmmPool,
    memeTokenInfo.toSplTokenInfo(),
    TOKEN_INFOS.CHAN.toSplTokenInfo(),
  );

  const chanAmmPool = new AmmPool(
    stakingPool.poolObjectData.chanAmmPool,
    stakingPool.poolObjectData.memeMint,
    TOKEN_INFOS.CHAN.mint,
    ammImplChan,
  );

  await stakingPool.addFeesToAmmPool(chanAmmPool, stakingPool, memeTokenInfo, TOKEN_INFOS.CHAN, clientV2, payer);
};

addFeesTx();
