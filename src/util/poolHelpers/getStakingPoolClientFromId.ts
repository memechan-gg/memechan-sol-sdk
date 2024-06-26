import { PublicKey } from "@solana/web3.js";
import { MEMECHAN_PROGRAM_ID_V2 } from "../../config/config";
import { MemechanClient } from "../../MemechanClient";
import { MemechanClientV2 } from "../../MemechanClientV2";
import { StakingPoolClient } from "../../staking-pool/StakingPoolClient";
import { StakingPoolClientV2 } from "../../staking-pool/StakingPoolClientV2";

export async function getStakingPoolClientFromId(
  poolAddressId: PublicKey,
  client: MemechanClient,
  clientV2: MemechanClientV2,
) {
  const accountInfo = await clientV2.connection.getAccountInfo(poolAddressId);

  if (!accountInfo) {
    throw new Error(`Account not found: ${poolAddressId.toString()}`);
  }

  console.log("accountInfo.owner:", accountInfo.owner);

  if (accountInfo.owner.toBase58() == MEMECHAN_PROGRAM_ID_V2) {
    return await StakingPoolClientV2.fromStakingPoolId({ client: clientV2, poolAccountAddressId: poolAddressId });
  }

  return await StakingPoolClient.fromStakingPoolId({ client: client, poolAccountAddressId: poolAddressId });
}
