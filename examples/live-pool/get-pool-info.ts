import { jsonInfo2PoolKeys } from "@raydium-io/raydium-sdk";
import { formatAmmKeysById } from "../../src/raydium/formatAmmKeysById";
import { connection } from "../common";

// yarn tsx examples/live-pool/get-pool-info.ts > log.txt 2>&1
export const getPoolInfo = async () => {
  const poolAddress = "BevUTtVUZQ4LdwWfcq4Uom88yuj1WE2EUiZBgESUsFQT";

  const targetPoolInfo = await formatAmmKeysById(poolAddress, connection);
  const poolKeys = jsonInfo2PoolKeys(targetPoolInfo);
  console.log("poolKeys:", poolKeys);
};

getPoolInfo();
