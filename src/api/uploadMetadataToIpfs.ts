import { getConfig } from "../config/config";
import { TokenAPI } from "./TokenAPI";
import { TokenMetadata } from "./types";

export async function uploadMetadataToIpfs(metadata: TokenMetadata): Promise<string> {
  const metadataBlob = new Blob([JSON.stringify(metadata)], { type: "application/json" });
  const fileName = "metadata.json";
  const metadataFile = new File([metadataBlob], fileName);

  const { BE_URL } = await getConfig();
  const tokenApi = new TokenAPI(BE_URL);
  const fileUploadResult = await tokenApi.uploadFile(metadataFile);

  // pump.fun uses this gateway
  const metadataUri = "https://cf-ipfs.com/ipfs/" + fileUploadResult.IpfsHash;

  console.log("metadataUri: " + metadataUri);

  return metadataUri;
}
