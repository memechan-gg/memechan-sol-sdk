import { clientV2, connection, payer } from "./../../common";
import { StakingPool as CodegenStakingPool } from "../../../src/schema/v2/codegen/accounts/StakingPool";
import { MEME_TOKEN_DECIMALS, StakingPoolClientV2, TOKEN_INFOS, TokenInfo } from "../../../src";
import { PublicKey } from "@solana/web3.js";
import { AmmPool } from "../../../src/meteora/AmmPool";
import AmmImpl from "@mercurial-finance/dynamic-amm-sdk";
import { NATIVE_MINT } from "@solana/spl-token";

// yarn tsx examples/v2/staking-pool/add-fees-tx.ts > add-fees-tx.txt 2>&1
export const addFeesTx = async () => {
  // Get staking pool
  const stakingPoolAddress = new PublicKey("BdJgoZcnGVEoH9zkudujF33oXZbzFbYVQpwtVznfkV87");
  const stakingPool = await StakingPoolClientV2.fromStakingPoolId({
    client: clientV2,
    poolAccountAddressId: stakingPoolAddress,
  });
  const ammPoolId = new PublicKey("4h1mxpkkh6PjLs71FxXRVBrEjBtknyiezgDu2pNVF2bc");

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
  // const ammImplChan = await AmmImpl.create(
  //   connection,
  //   stakingPool.poolObjectData.chanAmmPool,
  //   tokenInfoA,
  //   tokenInfoC
  // );

  const ammPool = new AmmPool(
    ammPoolId,
    stakingPool.poolObjectData.memeMint,
    stakingPool.poolObjectData.quoteMint,
    ammImplQuote,
  );

  await stakingPool.addFeesToAmmPool(ammPool, stakingPool, memeTokenInfo, TOKEN_INFOS.WSOL, clientV2, payer);
  // const transaction = await stakingPool.getAddFeesTransaction({
  //   payer: payer.publicKey,
  //   ammPoolId,
  // });

  // console.log("payer: " + payer.publicKey.toBase58());
  // const signature = await sendAndConfirmTransaction(clientV2.connection, transaction, [payer], {
  //   commitment: "confirmed",
  //   skipPreflight: true,
  //   preflightCommitment: "confirmed",
  // });
  // console.log("addfees signature:", signature);
};

addFeesTx();
