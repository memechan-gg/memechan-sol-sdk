import { PublicKey } from "@solana/web3.js";

import { BN } from "bn.js";
import { BoundPoolClientV2 } from "../../../src";
import { createMemeChanClientV2 } from "../../common";

// yarn tsx examples/v2/bonding-pool/getHoldersMap.ts > getHoldersMap.txt 2>&1

export async function getHoldersMap() {
  const poolAddress = new PublicKey("3NdXMCCgE5KD3gUrqZoueii3yWfrMQ6AB2Ecep2y43Rt");
  const clientV2 = await createMemeChanClientV2();

  const holdersMap = await BoundPoolClientV2.getHoldersMap(poolAddress, clientV2);
  console.log("holdersMap:", holdersMap);

  for (const [holder, holderData] of holdersMap.entries()) {
    console.log("Holder:", holder);
    for (const tokenData of holderData || []) {
      try {
        // Convert BN to BigNumber and then to a regular number safely
        const tokenAmount = new BN(tokenData.amount).toNumber();
        console.log(`Converted amount for holder ${holder}:`, tokenAmount);
      } catch (e) {
        console.error("Error converting token amount for holder", holder, tokenData, e);
      }
    }
  }
}

getHoldersMap();
