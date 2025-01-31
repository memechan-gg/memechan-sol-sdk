import { BE_URL } from "../config/config";
import { jsonFetch, signedJsonFetch } from "../util/fetch";
import { Auth } from "./auth/Auth";

/**
 * Service class for handling username-related operations.
 */
export class UsernameAPI {
  /**
   * Constructs a new UsernameAPI instance.
   * @param {string} url - The base URL for the backend service, defaults to BE_URL.
   */
  constructor(private url: string = BE_URL) {}

  /**
   * Sets a username for the authenticated user.
   * @param {string} username - The username to set.
   * @return {Promise<{ success: boolean, message: string }>} A Promise that resolves with the result of the operation.
   * @throws Will throw an error if authentication session is not active.
   */
  async setUsername(username: string): Promise<{ success: boolean; message: string }> {
    if (!Auth.currentSession) throw new Error("You don't have any active session, please run the Auth.refreshSession");
    return await signedJsonFetch(`${this.url}/sol/usernames`, Auth.currentSession, {
      method: "POST",
      body: { username },
    });
  }

  /**
   * Retrieves the wallet address associated with a given username.
   * @param {string} username - The username to look up.
   * @return {Promise<string>} A Promise that resolves with the wallet address.
   */
  async getWalletAddressForUsername(username: string): Promise<string> {
    return await jsonFetch(`${this.url}/sol/usernames/wallet-address?username=${username}`, {
      method: "GET",
    });
  }
}
