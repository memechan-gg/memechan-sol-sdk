/* eslint-disable max-len */
import { PublicKey } from "@solana/web3.js";
import { clientV2, payer } from "../../../common";
import { BoundPoolClientV2 } from "../../../../src/bound-pool/BoundPoolClientV2";
import { FEE_DESTINATION_ID, MEMECHAN_MEME_TOKEN_DECIMALS, MEME_TOKEN_DECIMALS, StakingPoolClientV2, TOKEN_INFOS, TokenInfo, getTokenInfoByMint } from "../../../../src";
import { ChanSwapClient } from "../../../../src/chan-swap/ChanSwapClient";

// yarn tsx examples/v2/bonding-pool/init-amm/init-amm-pools.ts
(async () => {
  const memeMint = new PublicKey("8yj642xHs8EePZBccgrCifoitmoKdwiZPVGovfVvezr5");
  const stakingId = BoundPoolClientV2.findStakingPda(memeMint, clientV2.memechanProgram.programId);

  const stakingPool = await StakingPoolClientV2.fromStakingPoolId({
    client: clientV2,
    poolAccountAddressId: stakingId,
  });

  console.debug("stakingPool: ", stakingPool);

  const memeTokenInfo = getTokenInfoByMint(memeMint);

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
  //   "[243,209,26,170,233,220,87,246,186,249,184,131,192,150,226,199,18,71,26,246,200,191,25,134,244,44,8,42,32,11,185,194,110,166,26,137,37,31,69,91,254,102,98,209,147,249,231,211,203,50,49,57,51,108,131,241,247,65,131,158,141,92,105,228]";
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
