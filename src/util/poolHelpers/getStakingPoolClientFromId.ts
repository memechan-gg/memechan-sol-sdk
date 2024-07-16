import { PublicKey } from "@solana/web3.js";
import { MemechanClient } from "../../MemechanClient";
import { MemechanClientV2 } from "../../MemechanClientV2";
import { StakingPoolClient } from "../../staking-pool/StakingPoolClient";
import { StakingPoolClientV2 } from "../../staking-pool/StakingPoolClientV2";
import { getConfig } from "../../config/config";

export type StakingPoolClientVersioned =
  | { version: "V1"; stakingPoolClient: StakingPoolClient }
  | { version: "V2"; stakingPoolClient: StakingPoolClientV2 };

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

  const config = await getConfig();

  if (accountInfo.owner.toBase58() == config.MEMECHAN_PROGRAM_ID_V2) {
    const instance = StakingPoolClientV2.fromAccountInfo({
      client: clientV2,
      poolAccountAddressId: poolAddressId,
      accountInfo,
    });

    return { stakingPoolClient: instance, version: "V2" };
  }

  const instance = StakingPoolClient.fromAccountInfo({
    client: client,
    poolAccountAddressId: poolAddressId,
    accountInfo,
  });
  return { stakingPoolClient: instance, version: "V1" };
}
