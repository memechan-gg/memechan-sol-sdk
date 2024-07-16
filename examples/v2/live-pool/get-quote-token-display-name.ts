import { PublicKey } from "@solana/web3.js";
import { LivePoolClientV2 } from "../../../src";
import { createMemeChanClientV2 } from "../../common";

// yarn tsx examples/v2/live-pool/get-quote-token-display-name.ts > log.txt 2>&1
export const getQuoteTokenDisplayName = async () => {
  const poolAddress = new PublicKey("69fywDppk1B9tXtGQJDiRKDcV8My6NLuyHgAmSToT6bZ");

  const clientV2 = await createMemeChanClientV2();
  const displayName = await LivePoolClientV2.getQuoteTokenDisplayName(poolAddress, clientV2);
  console.log("displayName:", displayName);
};

getQuoteTokenDisplayName();
