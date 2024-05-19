import { CoinAPI } from "../coin/CoinAPI";
import { TokenMetadata } from "./types";

export async function uploadMetadataToIpfs(metadata: TokenMetadata): Promise<string> {

const metadataBlob = new Blob([JSON.stringify(metadata)], { type: "application/json" });
  const fileName = "metadata.json";
  const metadataFile = new File([metadataBlob], fileName);

  const coinApi = new CoinAPI();
  const fileUploadResult = await coinApi.uploadFile(metadataFile);

  const metadataUri = "https://cf-ipfs.com/ipfs/" + fileUploadResult.IpfsHash;

  console.log("metadataUri: " + metadataUri);

  return metadataUri;
}