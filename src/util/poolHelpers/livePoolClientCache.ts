import { PublicKey } from "@solana/web3.js";
import { MemechanClient } from "../../MemechanClient";
import { MemechanClientV2 } from "../../MemechanClientV2";
import { getLivePoolClientFromIdInternal } from "./getLivePoolClientFromId";
import { LivePoolVersioned } from "./types";

export class LivePoolClientCache {
  private static cache: { [key: string]: LivePoolVersioned } = {};

  public static async getCachedLivePoolClientFromId(
    ammId: PublicKey,
    client: MemechanClient,
    clientV2: MemechanClientV2,
  ): Promise<LivePoolVersioned> {
    const cacheKey = ammId.toBase58();

    // Check if the result is in the cache
    if (LivePoolClientCache.cache[cacheKey]) {
      console.log(`Cache hit for ${cacheKey}`);
      return LivePoolClientCache.cache[cacheKey];
    }

    // Call the original function
    const livePoolVersioned = await getLivePoolClientFromIdInternal(ammId, client, clientV2);

    // Store the result in the cache
    LivePoolClientCache.cache[cacheKey] = livePoolVersioned;

    return livePoolVersioned;
  }

  // Optionally, provide a method to clear the cache
  public static clearCache() {
    LivePoolClientCache.cache = {};
  }
}
