import { PublicKey } from "@solana/web3.js";
import { getBoundPoolClientFromId } from "../../../src/util/getBoundPoolClientFromId";
import { client, clientV2 } from "../../common";

// yarn tsx examples/v2/bonding-pool/getBoundPoolClientFromId.ts > log.txt 2>&1
export const getBoundPoolClientFromIdTest = async () => {
  const poolAddress = new PublicKey("nmVPzadrsF1Af7dpvMEC87ozetCU9tUy8rAQhcB186Z");
  const boundPool = await getBoundPoolClientFromId(poolAddress, client, clientV2);
  console.log("boundPool:", boundPool);
};

getBoundPoolClientFromIdTest();
