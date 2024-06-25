import { PublicKey } from "@solana/web3.js";
import { MEMECHAN_PROGRAM_ID_V2 } from "../config/config";
import { BoundPoolClientV2 } from "../bound-pool/BoundPoolClientV2";
import { BoundPoolClient } from "../bound-pool/BoundPoolClient";
import { MemechanClient } from "../MemechanClient";
import { MemechanClientV2 } from "../MemechanClientV2";

export async function getBoundPoolClientFromId(
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
    return await BoundPoolClientV2.fromBoundPoolId({ client: clientV2, poolAccountAddressId: poolAddressId });
  }

  return await BoundPoolClient.fromBoundPoolId({ client: client, poolAccountAddressId: poolAddressId });
}
