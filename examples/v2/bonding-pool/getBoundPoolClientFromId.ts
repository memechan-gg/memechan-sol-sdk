import { PublicKey } from "@solana/web3.js";
import { getBoundPoolClientFromId } from "../../../src/util/poolHelpers/getBoundPoolClientFromId";
import { createMemeChanClient, createMemeChanClientV2 } from "../../common";

// yarn tsx examples/v2/bonding-pool/getBoundPoolClientFromId.ts > log.txt 2>&1
export const getBoundPoolClientFromIdTest = async () => {
  const poolAddress = new PublicKey("nmVPzadrsF1Af7dpvMEC87ozetCU9tUy8rAQhcB186Z");

  const client = await createMemeChanClient();
  const clientV2 = await createMemeChanClientV2();

  const boundPool = await getBoundPoolClientFromId(poolAddress, client, clientV2);
  console.log("boundPool:", boundPool);
};

getBoundPoolClientFromIdTest();
