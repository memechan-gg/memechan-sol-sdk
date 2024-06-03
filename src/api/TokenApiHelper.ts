import { PublicKey } from "@solana/web3.js";
import BN from "bn.js";
import { TokenAPI } from "./TokenAPI";
import { PROD_BE_URL } from "../config/config";

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
    console.log("holdersFromApi:", holdersFromApi);

    const convertedHolders = TokenApiHelper.convertBoundPoolHolders(holdersFromApi);
    console.log("convertedHolders:", convertedHolders);
  }

  /**
   * Converts the holders data from the Backend API to a Map of holders
   *
   * @param holdersFromApi The holders data from the Backend API
   * @returns The holders map with the wallet address as the key and MemeTicketFields[] as data
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public static convertBoundPoolHolders(holdersFromApi: any) {
    const holdersMap = new Map();

    holdersFromApi.result.forEach((holder: { walletAddress: string; tokenAddress: string; tokenAmount: BN }) => {
      const { walletAddress, tokenAddress, tokenAmount } = holder;

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
      };

      // Add to holdersMap
      if (!holdersMap.has(walletAddress)) {
        holdersMap.set(walletAddress, []);
      }
      holdersMap.get(walletAddress).push(holderData);
    });

    return holdersMap;
  }
}
