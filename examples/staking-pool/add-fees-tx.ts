import { PublicKey, sendAndConfirmTransaction } from "@solana/web3.js";
import { StakingPool as CodegenStakingPool } from "../../src/schema/codegen/accounts";
import { client, connection, payer } from "../common";
import { StakingPoolClient } from "../../src";

// yarn tsx examples/staking-pool/add-fees-tx.ts > add-fees-tx.txt 2>&1
export const addFeesTx = async () => {
  // Get staking pool
  const stakingPoolAddress = new PublicKey("Fd5cS4hYsh9ucnYxr4vJzixTNF2QLb49Xk5rKneiNe3U");
  const stakingPool = await StakingPoolClient.fromStakingPoolId({ client, poolAccountAddressId: stakingPoolAddress });
  const ammPoolId = new PublicKey("Fb3hJ7GErGH7c5chKa2vJC8J9H4AZv6TbnmkU4tT64aY");

  const fetchedStakingPool = await CodegenStakingPool.fetch(connection, stakingPoolAddress);
  console.log("fetchedStakingPool:", fetchedStakingPool?.toJSON());

  const transaction = await stakingPool.getAddFeesTransaction({
    payer: payer.publicKey,
    ammPoolId,
  });

  console.log("payer: " + payer.publicKey.toBase58());
  const signature = await sendAndConfirmTransaction(client.connection, transaction, [payer], {
    commitment: "confirmed",
    skipPreflight: true,
    preflightCommitment: "confirmed",
  });
  console.log("addfees signature:", signature);
};

addFeesTx();
