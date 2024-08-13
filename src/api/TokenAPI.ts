import { Auth } from "./auth/Auth";
import { BE_URL } from "../config/config";
import { jsonFetch, signedJsonFetch, unsignedMultipartRequest } from "../util/fetch";
import {
  TokenStatus,
  createCoinRequestBodySchema,
  CreateTokenRequestBody,
  QueryTokensRequestParams,
  SolanaTokenHoldersByTokenAddressRequest,
} from "./schemas/token-schemas";
import {
  CreateBoundPoolTransactionResponse,
  CreateTokenResponse,
  GetTokenResponse,
  GetWatchlistForWalletResponse,
  QueryHoldersByTokenAddressResponse,
  QueryTokensResponse,
  UploadFileResponse,
} from "./types";
import {
  getCreateNewBondingPoolAndTokenWithBuyMemeTransactionArgsV2,
  GetCreateNewBondingPoolAndTokenWithBuyMemeTransactionArgsV2Schema,
} from "./schemas/solana-create-bound-pool-tx-schema";

/**
 * Service class for handling coin-related operations.
 */
export class TokenAPI {
  /**
   * Constructs a new CoinService instance.
   * @param {string} url - The base URL for the backend service, defaults to BE_URL.
   */
  constructor(private url = BE_URL) {}

  /**
   * Fetches data about a specific coin.
   * @param {TokenStatus} status - The status of the coin that you want to fetch (LIVE or PRESALE)
   * @param {string} tokenAddress - The type of coin to query.
   * @throws Will throw an error if authentication session is not active.
   * @return {Promise<GetTokenResponse>} A promise that resolves with the coin data.
   */
  getToken(status: TokenStatus, tokenAddress: string): Promise<GetTokenResponse> {
    return jsonFetch(`${this.url}/sol/${status.toLowerCase()}/token?tokenAddress=${tokenAddress}`, {
      method: "GET",
    });
  }

  /**
   * Fetches data about a specific coin.
   * @param {SolanaTokenHoldersByTokenAddressRequest} params - The query parameters to filter holders.
   * @throws Will throw an error if authentication session is not active.
   * @return {Promise<QueryHoldersByTokenAddressResponse>} A promise that resolves with the holders data.
   */
  getHolders(params: SolanaTokenHoldersByTokenAddressRequest): Promise<QueryHoldersByTokenAddressResponse> {
    const { tokenAddress, paginationToken, direction, sortBy } = params;
    // eslint-disable-next-line max-len
    const request = `${this.url}/sol/holders?tokenAddress=${tokenAddress}${paginationToken ? "&paginationToken=" + paginationToken : ""}&direction=${direction}&sortBy=${sortBy}`;
    return jsonFetch(request, {
      method: "GET",
    });
  }

  /**
   * Queries coins based on specified parameters.
   * @param {QueryCoinsRequestParams} params - The query parameters to filter coins.
   * @throws Will throw an error if authentication session is not active.
   * @return {Promise<QueryTokensResponse>} A promise that resolves with the queried coin data.
   */
  queryTokens(params: QueryTokensRequestParams): Promise<QueryTokensResponse> {
    const queryParams = new URLSearchParams(params as Record<string, string>);
    return jsonFetch(`${this.url}/sol/${params.status.toLowerCase()}/tokens?${queryParams.toString()}`, {
      method: "GET",
    });
  }

  /**
   * Create coin
   * @param {CreateTokenRequestBody} params - The create coin request payload.
   * @throws Will throw an error if authentication session is not active.
   * @return {Promise<CreateTokenResponse>} A promise that resolves with the queried coin data.
   */
  createToken(params: CreateTokenRequestBody): Promise<CreateTokenResponse> {
    if (!Auth.currentSession) throw new Error("You don't have any active session, please run the Auth.refreshSession");
    return signedJsonFetch(`${this.url}/sol/token`, Auth.currentSession, {
      method: "POST",
      body: createCoinRequestBodySchema.parse(params),
    });
  }

  /**
   * uploadFile to ipfs
   * @param {File} file The URL to which the request is sent.
   * @return {Promise<UploadFileResponse>} A promise that resolves with the response of the fetch request.
   */
  uploadFile(file: File): Promise<UploadFileResponse> {
    return unsignedMultipartRequest(`${this.url}/upload-image`, file);
  }

  /**
   * Create BoundPool Transaction
   * @param {GetCreateNewBondingPoolAndTokenWithBuyMemeTransactionArgsV2Schema} params - The create coin request payload.
   * @throws Will throw an error if authentication session is not active.
   * @return {Promise<CreateTokenResponse>} A promise that resolves with the queried coin data.
   */
  async createBoundPoolTransaction(
    params: GetCreateNewBondingPoolAndTokenWithBuyMemeTransactionArgsV2Schema,
  ): Promise<CreateBoundPoolTransactionResponse> {
    if (!Auth.currentSession) throw new Error("You don't have any active session, please run the Auth.refreshSession");
    return await signedJsonFetch(`${this.url}/sol/bound-pool-tx`, Auth.currentSession, {
      method: "POST",
      body: getCreateNewBondingPoolAndTokenWithBuyMemeTransactionArgsV2.parse(params),
    });
  }

  /**
   * Create BoundPool
   * @param {GetCreateNewBondingPoolAndTokenWithBuyMemeTransactionArgsV2Schema} params - The create coin request payload.
   * @throws Will throw an error if authentication session is not active.
   * @return {Promise<CreateTokenResponse>} A promise that resolves with the queried coin data.
   */
  async createBoundPool(
    params: GetCreateNewBondingPoolAndTokenWithBuyMemeTransactionArgsV2Schema,
  ): Promise<CreateBoundPoolTransactionResponse> {
    if (!Auth.currentSession) throw new Error("You don't have any active session, please run the Auth.refreshSession");
    return await signedJsonFetch(`${this.url}/sol/bound-pool`, Auth.currentSession, {
      method: "POST",
      body: getCreateNewBondingPoolAndTokenWithBuyMemeTransactionArgsV2.parse(params),
    });
  }

  /**
   *insert Private Keys
   * @param {} params - The create coin request payload.
   * @throws Will throw an error if authentication session is not active.
   * @return {Promise<unkown>} A promise that resolves with the queried coin data.
   */
  async insertPrivateKeys(params: { privateKey: string; publicKey: string }[]): Promise<unknown> {
    if (!Auth.currentSession) throw new Error("You don't have any active session, please run the Auth.refreshSession");
    return await signedJsonFetch(`${this.url}/sol/private-keys`, Auth.currentSession, {
      method: "POST",
      body: params,
    });
  }

  /**
   * Add token to watchlist
   * @param {} params - The add token to watchlist request payload.
   * @throws Will throw an error if authentication session is not active.
   * @return {Promise<{ success: boolean }>} A promise that resolves with the addition of token to watchlist.
   */
  async addTokenToWatchlist(params: { walletAddress: string; tokenAddress: string }): Promise<{ success: boolean }> {
    if (!Auth.currentSession) throw new Error("You don't have any active session, please run the Auth.refreshSession");
    return await signedJsonFetch(`${this.url}/sol/watchlist`, Auth.currentSession, {
      method: "POST",
      body: params,
    });
  }

  /**
   * Remove token from watchlist
   * @param {} params - The remove token from watchlist request payload.
   * @throws Will throw an error if authentication session is not active.
   * @return {Promise<{ success: boolean }>} A promise that resolves with the deletion of coin from wallet watchlist.
   */
  async removeTokenFromWatchlist(params: {
    walletAddress: string;
    tokenAddress: string;
  }): Promise<{ success: boolean }> {
    if (!Auth.currentSession) throw new Error("You don't have any active session, please run the Auth.refreshSession");
    return await signedJsonFetch(`${this.url}/sol/watchlist`, Auth.currentSession, {
      method: "DELETE",
      body: params,
    });
  }

  /**
   * Get all tokens that are in a watchlist for a wallet address
   * @param {} params - The get all tokens request payload.
   * @throws Will throw an error if authentication session is not active.
   * @return {Promise<unkown>} A promise that resolves with the queried coin data.
   */
  async getAllWatchlistTokensForWallet(params: { walletAddress: string }): Promise<QueryTokensResponse> {
    if (!Auth.currentSession) throw new Error("You don't have any active session, please run the Auth.refreshSession");
    return await signedJsonFetch(`${this.url}/sol/watchlist/tokens`, Auth.currentSession, {
      method: "GET",
      body: params,
    });
  }

  /**
   * Get watchlist for wallet address
   * @param {} params - The get watchlist request payload.
   * @throws Will throw an error if authentication session is not active.
   * @return {Promise<unkown>} A promise that resolves with the queried watchlist.
   */
  async getWatchlistForWallet(params: { walletAddress: string }): Promise<GetWatchlistForWalletResponse> {
    if (!Auth.currentSession) throw new Error("You don't have any active session, please run the Auth.refreshSession");
    return await signedJsonFetch(`${this.url}/sol/watchlist`, Auth.currentSession, {
      method: "GET",
      body: params,
    });
  }

  /**
   * Checks if token is in watchlist of a wallet
   * @param {} params - The create coin request payload.
   * @throws Will throw an error if authentication session is not active.
   * @return {Promise<unkown>} A promise that resolves with the queried coin data.
   */
  async isTokenInWalletWatchlist(params: { walletAddress: string; tokenAddress: string }): Promise<boolean> {
    if (!Auth.currentSession) throw new Error("You don't have any active session, please run the Auth.refreshSession");
    return await signedJsonFetch(`${this.url}/sol/watchlist/token`, Auth.currentSession, {
      method: "GET",
      body: params,
    });
  }
}
