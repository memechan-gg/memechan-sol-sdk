import { PublicKey } from "@solana/web3.js";
import { BoundPoolClient } from "../../src/bound-pool/BoundPoolClient";
import { BN } from "bn.js";
import { createMemeChanClient } from "../common";

// yarn tsx examples/bonding-pool/getHoldersMap.ts > getHoldersMap.txt 2>&1

export async function getHoldersMap() {
  const poolAddress = new PublicKey("653jVw4EHQbcHRZBWXB3DVBkvkvS6kyRQhcvphoxEf36");
  const client = await createMemeChanClient();

  const holdersMap = await BoundPoolClient.getHoldersMap(poolAddress, client);
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
