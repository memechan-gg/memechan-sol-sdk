import { PublicKey } from "@solana/web3.js";
import { BoundPoolClient } from "../../src/bound-pool/BoundPool";
import { client, payer } from "../common";
import { FEE_DESTINATION_ID } from "../env";

// yarn tsx examples/bonding-pool/go-live-exact.ts > go-live-exact.txt 2>&1
export const goLiveExact = async () => {
  const poolAddress = new PublicKey("87E5FsKU7Jff99Upn3DNrPbmSPLBEQaSwiozC6rcrpqG");
  const boundPool = await BoundPoolClient.fromBoundPoolId({ client, poolAccountAddressId: poolAddress });
  const boundPoolInfo = await BoundPoolClient.fetch2(client.connection, poolAddress);

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

  console.log("Go live finished | Staking pool id: " + stakingPool.id.toString());
};

goLiveExact();
