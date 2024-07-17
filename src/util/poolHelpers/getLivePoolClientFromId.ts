import { PublicKey } from "@solana/web3.js";
import { MERCURIAL_AMM_PROGRAM_ID } from "../../config/config";
import { MemechanClient } from "../../MemechanClient";
import { MemechanClientV2 } from "../../MemechanClientV2";
import { LivePoolClientV2 } from "../../live-pool/LivePoolClientV2";
import { LivePoolClient } from "../../live-pool/LivePoolClient";
import { LivePoolVersioned } from "./types";
import { LivePoolClientCache } from "./livePoolClientCache";

export async function getLivePoolClientFromIdInternal(
  ammId: PublicKey,
  client: MemechanClient,
  clientV2: MemechanClientV2,
): Promise<LivePoolVersioned> {
  const accountInfo = await clientV2.connection.getAccountInfo(ammId);

  if (!accountInfo) {
    throw new Error(`Account not found: ${ammId.toString()}`);
  }

  console.log("accountInfo.owner:", accountInfo.owner);

  if (accountInfo.owner.toBase58() == MERCURIAL_AMM_PROGRAM_ID) {
    const pool = await LivePoolClientV2.fromAccountInfo(ammId, accountInfo, clientV2);
    return { livePool: pool, version: "V2" };
  }

  const pool = await LivePoolClient.fromAccountInfo(ammId, accountInfo, client);
  return { livePool: pool, version: "V1" };
}

export async function getLivePoolClientFromId(
  ammId: PublicKey,
  client: MemechanClient,
  clientV2: MemechanClientV2,
  useCache: boolean = true,
): Promise<LivePoolVersioned> {
  if (useCache) {
    return LivePoolClientCache.getCachedLivePoolClientFromId(ammId, client, clientV2);
  }

  const accountInfo = await clientV2.connection.getAccountInfo(ammId);

  if (!accountInfo) {
    throw new Error(`Account not found: ${ammId.toString()}`);
  }

  console.log("accountInfo.owner:", accountInfo.owner);

  if (accountInfo.owner.toBase58() === MERCURIAL_AMM_PROGRAM_ID) {
    const pool = await LivePoolClientV2.fromAccountInfo(ammId, accountInfo, clientV2);
    return { livePool: pool, version: "V2" };
  }

  const pool = await LivePoolClient.fromAccountInfo(ammId, accountInfo, client);
  return { livePool: pool, version: "V1" };
}
