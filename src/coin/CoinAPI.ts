import { Auth } from "../auth/Auth";
import { signedJsonFetch, unsignedMultipartRequest } from "../utils/fetch";
import { CreateCoinRequestBody, CreateCoinResponse, QueryCoinsResponse, UploadFileResponse } from "./types";

export class CoinAPI {
  constructor(private url = process.env.BE_URL) {}

  queryCoins(): Promise<QueryCoinsResponse> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const response: QueryCoinsResponse = {
          coins: [],
        };
        resolve(response);
      }, 1000);
    });
  }

  uploadFile(file: File): Promise<UploadFileResponse> {
    return unsignedMultipartRequest(`${this.url}/upload-image`, file);
  }

   /**
   * Create coin
   * @param {CreateCoinRequestBody} params - The create coin request payload.
   * @throws Will throw an error if authentication session is not active.
   * @return {Promise<any>} A promise that resolves with the queried coin data.
   */
  createCoin(params: CreateCoinRequestBody): Promise<CreateCoinResponse> {
    if (!Auth.currentSession) throw new Error("You don't have any active session, please run the Auth.refreshSession");
    return signedJsonFetch(`${this.url}/coin`, Auth.currentSession, {
      method: "POST",
      body: params,
    });
  }
}
