import { PublicKey } from "@solana/web3.js";
import { client, payer } from "../../common";
import { BoundPoolClient, FEE_DESTINATION_ID, StakingPoolClient } from "../../../src";

// yarn tsx examples/bonding-pool/go-live-exact.ts > go-live-exact.txt 2>&1
export const goLiveExact = async () => {
  // const poolAddress = new PublicKey("Ft1hfEAoNY8ABrFL7LdAMQj9jZVe4gbw8e633SyN4ChH");
  // const boundPool = await BoundPoolClient.fromBoundPoolId({ client, poolAccountAddressId: poolAddress });
  // const boundPoolInfo = await BoundPoolClient.fetch2(client.connection, poolAddress);

  // const { stakingMemeVault, stakingQuoteVault } = await boundPool.initStakingPool({
  //   payer: payer,
  //   user: payer,
  //   boundPoolInfo,
  // });

  // eslint-disable-next-line max-len
  // const pda =  BoundPoolClient.findStakingPda(new PublicKey("2Y3jTuAc778X9Fgh9iejxpK6zBYDSwpUdr1Kz5SdGh5x"), client.memechanProgram.programId);
  //   console.log("pda: " + pda.toString());

  const { getAccount } = await import("@solana/spl-token");

  const stakingPool = await StakingPoolClient.fromStakingPoolId({
    client,
    poolAccountAddressId: new PublicKey("C898rurFKQ1hqcRH3a8HkzkrdrWvmaevTy4YhqbMJYeF"),
  });
  // console.log("stakingMemeVault: " + stakingMemeVault.toString());
  // console.log("stakingQuoteVault: " + stakingQuoteVault.toString());
  const quoteAccount = await getAccount(client.connection, stakingPool.quoteVault);

  await BoundPoolClient.goLive({
    payer: payer,
    user: payer,
    client,
    memeMint: new PublicKey("2Y3jTuAc778X9Fgh9iejxpK6zBYDSwpUdr1Kz5SdGh5x"),
    feeDestinationWalletAddress: FEE_DESTINATION_ID,
    memeVault: stakingPool.memeVault,
    quoteVault: stakingPool.quoteVault,
    quoteMint: quoteAccount.mint,
  });

  console.log("Go live finished | Staking pool id: " + stakingPool.id.toString());
};

goLiveExact();
