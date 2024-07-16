import { PublicKey } from "@solana/web3.js";
import { BoundPoolClient } from "../../src/bound-pool/BoundPoolClient";
import { createMemeChanClient } from "../common";

// yarn tsx examples/bonding-pool/getHoldersList.ts > getHoldersList.txt 2>&1
export async function getHoldersList() {
  const poolAddress = new PublicKey("3KzDGG71bzzZUApLNukyqVPZs4EJBd6SpJMh6ze6SDp2");
  const client = await createMemeChanClient();

  const holdersList = await BoundPoolClient.getHoldersList(poolAddress, client);
  console.log("holdersList:", holdersList);
}

getHoldersList();
