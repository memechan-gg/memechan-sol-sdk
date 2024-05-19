export interface QueryCoinsRequestParams {}

export interface CoinDetails {
  name: string;
  type: string;
  decimals: number;
  symbol: string;
  description: string;
  image: string;
  marketcap: number;
  creatorAddress: string;
  status: number;
  socialLinks: string[];
  creationTime: number;
  coinAddress: string;
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

export type CreateCoinResponse = {
  coin: object;
};

export type CreateCoinRequestBody = {
  txDigest: string;
}
