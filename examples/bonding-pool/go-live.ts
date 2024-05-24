import { BN } from "bn.js";
import { BoundPoolClient } from "../../src/bound-pool/BoundPool";
import { MEMECHAN_QUOTE_TOKEN } from "../../src/config/config";
import { DUMMY_TOKEN_METADATA, admin, client, payer } from "../common";
import { FEE_DESTINATION_ID } from "../env";

// yarn tsx examples/bonding-pool/go-live.ts > go-live.txt 2>&1
export const goLive = async () => {
  const boundPool = await BoundPoolClient.new({
    admin,
    payer,
    client,
    quoteToken: MEMECHAN_QUOTE_TOKEN,
    tokenMetadata: DUMMY_TOKEN_METADATA,
  });
  console.log("boundPool:", boundPool);
  console.log("==== pool id: " + boundPool.id.toString());

  const ticketId = await boundPool.swapY({
    payer: payer,
    user: payer,
    memeTokensOut: new BN(10000),
    quoteAmountIn: new BN(10000000),
    quoteMint: MEMECHAN_QUOTE_TOKEN.mint,
    pool: boundPool.id,
  });
  console.log("ticketId:", ticketId);

  const boundPoolInfo = await BoundPoolClient.fetch2(client.connection, boundPool.id);

  const { stakingMemeVault, stakingQuoteVault } = await boundPool.initStakingPool({
    payer: payer,
    user: payer,
    boundPoolInfo,
  });

  console.log("stakingMemeVault: " + stakingMemeVault.toString());
  console.log("stakingQuoteVault: " + stakingQuoteVault.toString());

  const [stakingPool] = await boundPool.goLive({
    payer: payer,
    user: payer,
    boundPoolInfo,
    feeDestinationWalletAddress: FEE_DESTINATION_ID,
    memeVault: stakingMemeVault,
    quoteVault: stakingQuoteVault,
  });

  console.log("golive finished. stakingPool: " + stakingPool.id.toString());
};

goLive();
