export interface QueryCoinsRequestParams {}

export interface CoinDetails {
  name: string;
  type: string;
  decimals: number;
  symbol: string;
  objectId: string;
  treasureCapId: string;
  objectType: string;
  description: string;
  image: string;
  metadataObjectId: string;
  lastReply: number;
  marketcap: number;
  creator: number;
  status: number;
  socialLinks: string[];
  txDigest: string;
  creationTime: number;
  contractAddress: string;
}

export interface QueryCoinsResponse {
  coins: CoinDetails[];
}

export type UploadFileResponse = {
  IpfsHash: string;
  PinSize: number;
  Timestamp: string;
  isDuplicate: boolean;
};
