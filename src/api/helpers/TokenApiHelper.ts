import { PublicKey } from "@solana/web3.js";
import BN from "bn.js";
import { TokenAPI } from "../TokenAPI";
import { BE_URL, MEME_TOKEN_DECIMALS } from "../../config/config";
import { ConvertedHolderMap, QueryHoldersByTokenAddressResponse } from "../types";
import BigNumber from "bignumber.js";
import { StakingPoolClient } from "../../staking-pool/StakingPoolClient";

export class TokenApiHelper {
  /**
   * Fetches the holders data from the Backend API and converts it to a Map of holders
   *
   * @param pool The tokenAddress PublicKey
   * @param beUrl The Backend API URL
   * @returns The holders map with the wallet address as the key and MemeTicketFields[] as data
   */
  public static async getBondingPoolHoldersMap(
    tokenAddress: PublicKey,
    beUrl: string = BE_URL,
  ): Promise<ConvertedHolderMap> {
    const tokenService = new TokenAPI(beUrl);
    const holdersFromApi = await tokenService.getHolders({
      tokenAddress: tokenAddress.toBase58(),
      direction: "desc",
      sortBy: "tokenAmountInPercentage",
    });

    return TokenApiHelper.convertBoundPoolHolders(holdersFromApi);
  }

  /**
   * Fetches the holders data from the Backend API and converts it to a Map of holders
   *
   * @param tokenAddress The meme token Address PublicKey (the mint)
   * @param client The MemechanClient instance
   * @param beUrl The Backend API URL
   * @returns The holders map with the wallet address as the key and MemeTicketFields[] as data
   */
  public static async getStakingPoolHoldersList(
    tokenAddress: PublicKey,
    stakingPoolId: PublicKey,
    memeChanProgramId: PublicKey,
    beUrl: string = BE_URL,
  ): Promise<
    [
      { address: string; tokenAmount: BigNumber; tokenAmountInPercentage: BigNumber }[],
      { address: string; amount: BigNumber },
    ]
  > {
    const tokenService = new TokenAPI(beUrl);
    const holdersFromApi = await tokenService.getHolders({
      tokenAddress: tokenAddress.toBase58(),
      direction: "desc",
      sortBy: "tokenAmountInPercentage",
    });

    const holdersList = holdersFromApi.result.map((holder) => {
      const { walletAddress, tokenAmount, tokenAmountInPercentage } = holder;
      return {
        address: walletAddress,
        tokenAmount: new BigNumber(tokenAmount),
        tokenAmountInPercentage: new BigNumber(tokenAmountInPercentage),
      };
    });

    const stakingSignerId = StakingPoolClient.findSignerPda(stakingPoolId, memeChanProgramId);
    // Find the holder with the stakingSigner
    const stakingHolder = holdersList.find((holder) => holder.address === stakingSignerId.toBase58()) || {
      address: "",
      tokenAmount: new BigNumber(0),
    };

    // Filter out the stakingHolder from the holdersList
    const filteredHoldersList = holdersList.filter((holder) => holder.address !== stakingSignerId.toBase58());

    return [filteredHoldersList, { address: stakingHolder.address, amount: stakingHolder.tokenAmount }];
  }

  /**
   * Converts the holders data from the Backend API to a Map of holders
   *
   * @param holdersFromApi The holders data from the Backend API
   * @returns The holders map with the wallet address as the key and MemeTicketFields[] as data
   *
   * @Note Do not relay on `percetange` value for pre-sale (bound pool)
   */
  public static convertBoundPoolHolders(holdersFromApi: QueryHoldersByTokenAddressResponse): ConvertedHolderMap {
    const holdersMap: ConvertedHolderMap = new Map();

    holdersFromApi.result.forEach((holder) => {
      const { walletAddress, tokenAddress, tokenAmount, tokenAmountInPercentage } = holder;

      // Create PublicKey instances
      const ownerPublicKey = new PublicKey(walletAddress);
      const poolPublicKey = new PublicKey(tokenAddress);

      const tokenAmountBigNum = new BigNumber(tokenAmount).multipliedBy(MEME_TOKEN_DECIMALS);
      const tokenAmountBN = new BN(tokenAmountBigNum.toString());

      // Create the holder data object
      const holderData = {
        owner: ownerPublicKey,
        pool: poolPublicKey,
        amount: tokenAmountBN,
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
