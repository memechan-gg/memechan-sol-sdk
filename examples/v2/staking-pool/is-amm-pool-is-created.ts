import { PublicKey } from "@solana/web3.js";
import { StakingPoolClientV2 } from "../../../src";
import { clientV2 } from "../../common";

// TODO
// yarn tsx examples/v2/staking-pool/is-amm-pool-is-created.ts
export async function fetch() {
  // true
  //   const memeMintPubkey = new PublicKey("2enLnBFz1w8qV2Kn88bdTw1PKMkspCfL5fgJrkLMDSJF");
  //   const isPoolCreated = await StakingPoolClient.isAmmPoolIsCreated({ connection: client.connection, memeMintPubkey });

  //   console.debug("isPoolCreated: ", isPoolCreated);

  // false
  const memeMintPubkey = new PublicKey("G6wyDdcDn6pJuPbferviyZh6JFgxDoyasYX8MsorJPoK");
  const isPoolCreated = await StakingPoolClientV2.isAmmPoolIsCreated({
    connection: clientV2.connection,
    memeMintPubkey,
  });

  console.debug("isPoolCreated: ", isPoolCreated);
}

fetch();
