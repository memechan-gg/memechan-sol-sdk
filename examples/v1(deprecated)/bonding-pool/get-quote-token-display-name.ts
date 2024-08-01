import { PublicKey } from "@solana/web3.js";
import { BoundPoolClient } from "../../src/bound-pool/BoundPoolClient";
import { connection } from "../common";

// yarn tsx examples/bonding-pool/get-quote-token-display-name.ts > log.txt 2>&1
export async function fetch() {
  const poolAddress = new PublicKey("7y7g19JdRaTNhSChuiXBoujAzkCCPDZeFFa4XWLU1oE1");

  const displayName = await BoundPoolClient.getQuoteTokenDisplayName(poolAddress, connection);
  console.log("displayName:", displayName);
}

fetch();
