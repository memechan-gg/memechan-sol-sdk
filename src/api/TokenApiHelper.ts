import { PublicKey } from "@solana/web3.js";
import BN from "bn.js";
import { TokenAPI } from "./TokenAPI";
import { PROD_BE_URL } from "../config/config";
import { ConvertedHolderMap, QueryHoldersByTokenAddressResponse } from "./types";

export class TokenApiHelper {
  /**
   * Fetches the holders data from the Backend API and converts it to a Map of holders
   *
   * @param pool The pool PublicKey
   * @param beUrl The Backend API URL
   * @returns The holders map with the wallet address as the key and MemeTicketFields[] as data
   */
  public static async getHoldersMapFromBackend(poolAddress: PublicKey, beUrl: string = PROD_BE_URL) {
    const tokenService = new TokenAPI(beUrl);
    const holdersFromApi = await tokenService.getHolders({
      tokenAddress: poolAddress.toBase58(),
      direction: "desc",
      sortBy: "tokenAmount",
    });

    return TokenApiHelper.convertBoundPoolHolders(holdersFromApi);
  }

  /**
   * Converts the holders data from the Backend API to a Map of holders
   *
   * @param holdersFromApi The holders data from the Backend API
   * @returns The holders map with the wallet address as the key and MemeTicketFields[] as data
   *
   * @Note Do not relay on `percetange` value for pre-sale (bound pool)
   */
  public static convertBoundPoolHolders(holdersFromApi: QueryHoldersByTokenAddressResponse) {
    const holdersMap: ConvertedHolderMap = new Map();

    holdersFromApi.result.forEach((holder) => {
      const { walletAddress, tokenAddress, tokenAmount, tokenAmountInPercentage } = holder;

      // Create PublicKey instances
      const ownerPublicKey = new PublicKey(walletAddress);
      const poolPublicKey = new PublicKey(tokenAddress);

      // Convert tokenAmount to BN
      const amountBN = new BN(tokenAmount.toString());

      // Create the holder data object
      const holderData = {
        owner: ownerPublicKey,
        pool: poolPublicKey,
        amount: amountBN,
        percetange: tokenAmountInPercentage,
      };

      // Add to holdersMap
      if (!holdersMap.has(walletAddress)) {
        holdersMap.set(walletAddress, holderData);
      } else if (holdersMap.has(walletAddress)) {
        const holder = holdersMap.get(walletAddress);

        // satisfy ts
        if (!holder) {
          throw new Error(`[convertBoundPoolHolders] holdersMap is inconsistent, ${walletAddress} duplicated`);
        }
      }
    });

    return holdersMap;
  }
}
