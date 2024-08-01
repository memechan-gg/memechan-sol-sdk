import { client } from "../../common";
import { StakingPoolClient } from "../../../src";
import { PublicKey } from "@solana/web3.js";

// yarn tsx examples/staking-pool/is-amm-pool-is-created.ts
export async function fetch() {
  // true
  //   const memeMintPubkey = new PublicKey("2enLnBFz1w8qV2Kn88bdTw1PKMkspCfL5fgJrkLMDSJF");
  //   const isPoolCreated = await StakingPoolClient.isAmmPoolIsCreated({ connection: client.connection, memeMintPubkey });

  //   console.debug("isPoolCreated: ", isPoolCreated);

  // false
  const memeMintPubkey = new PublicKey("B2qRE4ATifEkWSBRDBYuWcvxvXRGWvmaBrSJCgQ8etiM");
  const isPoolCreated = await StakingPoolClient.isAmmPoolIsCreated({ connection: client.connection, memeMintPubkey });

  console.debug("isPoolCreated: ", isPoolCreated);
}

fetch();
