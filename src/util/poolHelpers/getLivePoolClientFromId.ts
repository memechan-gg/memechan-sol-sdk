import { PublicKey } from "@solana/web3.js";
import { MEMECHAN_PROGRAM_ID_V2 } from "../../config/config";
import { MemechanClient } from "../../MemechanClient";
import { MemechanClientV2 } from "../../MemechanClientV2";
import { LivePoolClientV2 } from "../../live-pool/LivePoolClientV2";
import { LivePoolClient } from "../../live-pool/LivePoolClient";

export async function getLivePoolClientFromId(ammId: PublicKey, client: MemechanClient, clientV2: MemechanClientV2) {
  const accountInfo = await clientV2.connection.getAccountInfo(ammId);

  if (!accountInfo) {
    throw new Error(`Account not found: ${ammId.toString()}`);
  }

  console.log("accountInfo.owner:", accountInfo.owner);

  if (accountInfo.owner.toBase58() == MEMECHAN_PROGRAM_ID_V2) {
    const pool = await LivePoolClientV2.fromAmmId(ammId, clientV2);
    return { livePool: pool, version: "V2" };
  }

  const pool = await LivePoolClient.fromAmmId(ammId, client);
  return { livePool: pool, version: "V1" };
}
