import { unsignedMultipartRequest } from "../utils/fetchs";
import { QueryCoinsResponse, UploadFileResponse } from "./types";

export class CoinAPI {
  constructor(private url = process.env.BE_URL) {}

  queryCoins(): Promise<QueryCoinsResponse> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const response: QueryCoinsResponse = {
          coins: [
            {
              name: "DummyCoin",
              type: "Cryptocurrency",
              decimals: 18,
              symbol: "DMC",
              objectId: "obj123",
              treasureCapId: "tc123",
              objectType: "coin",
              description: "A dummy cryptocurrency for demonstration purposes.",
              image: "https://example.com/dummycoin.jpg",
              metadataObjectId: "meta123",
              lastReply: 1622548800,
              marketcap: 1000000,
              creator: 1,
              status: 0,
              socialLinks: ["https://twitter.com/dummycoin", "https://github.com/dummycoin"],
              txDigest: "0x123456789abcdef",
              creationTime: 1622548800,
              contractAddress: "0x123456789abcdef123456789abcdef12345678",
            },
          ],
        };
        resolve(response);
      }, 1000);
    });
  }

  uploadFile(file: File): Promise<UploadFileResponse> {
    return unsignedMultipartRequest(`${this.url}/upload-image`, file);
  }
}
