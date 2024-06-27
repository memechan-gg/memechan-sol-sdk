/* eslint-disable max-len */
import { PublicKey } from "@solana/web3.js";
import { clientV2, payer } from "../../../common";
import { BoundPoolClientV2 } from "../../../../src/bound-pool/BoundPoolClientV2";
import { FEE_DESTINATION_ID, MEME_TOKEN_DECIMALS, StakingPoolClientV2, TOKEN_INFOS, TokenInfo } from "../../../../src";
import { NATIVE_MINT } from "@solana/spl-token";
import { ChanSwapClient } from "../../../../src/chan-swap/ChanSwapClient";
import { Keypair } from "@solana/web3.js";

// yarn tsx examples/v2/bonding-pool/init-amm/init-amm-pools.ts
(async () => {
  const memeMint = new PublicKey("G6wyDdcDn6pJuPbferviyZh6JFgxDoyasYX8MsorJPoK");
  const stakingId = BoundPoolClientV2.findStakingPda(memeMint, clientV2.memechanProgram.programId);

  const stakingPool = await StakingPoolClientV2.fromStakingPoolId({
    client: clientV2,
    poolAccountAddressId: stakingId,
  });

  console.debug("stakingPool: ", stakingPool);

  const memeTokenInfo = new TokenInfo({
    decimals: MEME_TOKEN_DECIMALS,
    mint: memeMint,
    name: "MEME",
    programId: clientV2.memechanProgram.programId,
    symbol: "MEME",
    targetConfig: NATIVE_MINT,
    targetConfigV2: NATIVE_MINT,
  });

  try {
    const initQuoteAmmPoolResult = await BoundPoolClientV2.initQuoteAmmPool({
      payer: payer,
      user: payer,
      tokenInfoA: memeTokenInfo,
      tokenInfoB: TOKEN_INFOS.WSOL,
      memeVault: stakingPool.memeVault,
      quoteVault: stakingPool.quoteVault,
      client: clientV2,
      feeDestinationWalletAddress: new PublicKey(FEE_DESTINATION_ID),
    });
    console.log("initQuoteAmmPool result: ", initQuoteAmmPoolResult);
  } catch (e) {
    console.error("initQuoteAmmPool error: ", e);
  }

  // const adminSecretKey =
  //   "";
  // const adminPayer = Keypair.fromSecretKey(Buffer.from(JSON.parse(adminSecretKey)));
  // await ChanSwapClient.new(45_000, 1, clientV2, adminPayer);

  try {
    const initChanAmmPoolResult = await BoundPoolClientV2.initChanAmmPool({
      payer: payer,
      user: payer,
      tokenInfoA: memeTokenInfo,
      tokenInfoB: TOKEN_INFOS.CHAN,
      memeVault: stakingPool.memeVault,
      quoteVault: stakingPool.quoteVault,
      client: clientV2,
      feeDestinationWalletAddress: new PublicKey(FEE_DESTINATION_ID),
      chanSwap: ChanSwapClient.chanSwapId(),
    });

    console.log("initChanAmmPoolResult: ", initChanAmmPoolResult);
  } catch (e) {
    console.error("initChanAmmPool error: ", e);
  }
})();
