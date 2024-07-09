import { clientV2, connection, payer } from "./../../common";
import { StakingPool as CodegenStakingPool } from "../../../src/schema/v2/codegen/accounts/StakingPool";
import { BoundPoolClientV2, StakingPoolClientV2 } from "../../../src";
import { PublicKey, sendAndConfirmTransaction } from "@solana/web3.js";

// yarn tsx examples/v2/staking-pool/add-fees-tx.ts > add-fees-tx.txt 2>&1
export const addFeesTx = async () => {
  // Get staking pool
  const memeMint = new PublicKey("HZUAFBsoVPb2u1paMmiNjc6QvRioXTYNvC3zXtu3HxMX");
  const stakingPoolAddress = BoundPoolClientV2.findStakingPda(memeMint, clientV2.memechanProgram.programId);

  const stakingPool = await StakingPoolClientV2.fromStakingPoolId({
    client: clientV2,
    poolAccountAddressId: stakingPoolAddress,
  });
  const fetchedStakingPool = await CodegenStakingPool.fetch(connection, stakingPoolAddress);
  console.log("fetchedStakingPool:", fetchedStakingPool?.toJSON());

  const quoteFeesTx = await stakingPool.getAddFeesTransaction({
    payer: payer.publicKey,
    ammPoolId: stakingPool.poolObjectData.quoteAmmPool,
  });

  console.log("payer: " + payer.publicKey.toBase58());

  try {
    const signature = await sendAndConfirmTransaction(connection, quoteFeesTx, [payer], {
      commitment: "confirmed",
      skipPreflight: true,
      preflightCommitment: "confirmed",
    });
    console.log("addfees quoteFeesTx signature:", signature);
  } catch (e) {
    console.error("addfees quoteFeesTx error:", e);
  }

  // CHAN
  const chanFeesTx = await stakingPool.getAddFeesTransaction({
    payer: payer.publicKey,
    ammPoolId: stakingPool.poolObjectData.chanAmmPool,
  });

  console.log("payer: " + payer.publicKey.toBase58());
  try {
    const signature2 = await sendAndConfirmTransaction(connection, chanFeesTx, [payer], {
      commitment: "confirmed",
      skipPreflight: true,
      preflightCommitment: "confirmed",
    });
    console.log("addfees chanFeesTx signature:", signature2);
  } catch (e) {
    console.error("addfees chanFeesTx error:", e);
  }
};

addFeesTx();
