import { clientV2, connection, payer } from "./../../common";
import { StakingPool as CodegenStakingPool } from "../../../src/schema/v2/codegen/accounts/StakingPool";
import { StakingPoolClientV2 } from "../../../src";
import { PublicKey, sendAndConfirmTransaction } from "@solana/web3.js";

// yarn tsx examples/staking-pool/add-fees-tx.ts > add-fees-tx.txt 2>&1
export const addFeesTx = async () => {
  // Get staking pool
  const stakingPoolAddress = new PublicKey("EQUjkMoKSnSxDLmJsVP9XpaRKHd46m4yfjERjCrFoehR");
  const stakingPool = await StakingPoolClientV2.fromStakingPoolId({
    client: clientV2,
    poolAccountAddressId: stakingPoolAddress,
  });
  const ammPoolId = new PublicKey("Fb3hJ7GErGH7c5chKa2vJC8J9H4AZv6TbnmkU4tT64aY");

  const fetchedStakingPool = await CodegenStakingPool.fetch(connection, stakingPoolAddress);
  console.log("fetchedStakingPool:", fetchedStakingPool?.toJSON());

  const transaction = await stakingPool.getAddFeesTransaction({
    payer: payer.publicKey,
    ammPoolId,
  });

  console.log("payer: " + payer.publicKey.toBase58());
  const signature = await sendAndConfirmTransaction(clientV2.connection, transaction, [payer], {
    commitment: "confirmed",
    skipPreflight: true,
    preflightCommitment: "confirmed",
  });
  console.log("addfees signature:", signature);
};

addFeesTx();
