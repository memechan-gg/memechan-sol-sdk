import { unsignedMultipartRequest } from "../utils/fetchs";
import { QueryCoinsResponse, UploadFileResponse } from "./types";

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
}
