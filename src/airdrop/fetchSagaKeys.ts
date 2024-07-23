import { PublicKey } from "@solana/web3.js";
import { HeliusApiInstance } from "../../examples/common";

export async function fetchSagaKeys(): Promise<PublicKey[]> {
  const sagaNftAssets = await HeliusApiInstance.getAssetsByGroup(
    new PublicKey("46pcSL5gmjBrPqGKFaLbbCmR6iVuLJbnQy13hAe7s6CC"), // Genesis Token Collection NFT Address
  );

  const ownerAddressSet = new Set<PublicKey>();

  sagaNftAssets.forEach((asset) => ownerAddressSet.add(new PublicKey(asset.ownership.owner)));

  return Array.from(ownerAddressSet);
}
