import { client } from "../../common";
import { LivePoolClient } from "../../../src";
import { PublicKey } from "@solana/web3.js";

// yarn tsx examples/live-pool/get-quote-token-display-name.ts > log.txt 2>&1
export const getQuoteTokenDisplayName = async () => {
  const poolAddress = new PublicKey("BevUTtVUZQ4LdwWfcq4Uom88yuj1WE2EUiZBgESUsFQT");

  const displayName = await LivePoolClient.getQuoteTokenDisplayName(poolAddress, client);
  console.log("displayName:", displayName);
};

getQuoteTokenDisplayName();
