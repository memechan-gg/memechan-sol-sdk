import { jsonInfo2PoolKeys } from "@raydium-io/raydium-sdk";
import { formatAmmKeysById } from "../../src/raydium/formatAmmKeysById";
import { connection } from "../common";

// yarn tsx examples/raydium/get-pool-info.ts > log.txt 2>&1
export const getPoolInfo = async () => {
  const poolAddress = "BY6xstuufxC7sii4iqYXToSzYrT8wBcLkrwrVatHXkQs";

  const targetPoolInfo = await formatAmmKeysById(poolAddress, connection);
  const poolKeys = jsonInfo2PoolKeys(targetPoolInfo);
  console.log("poolKeys:", poolKeys);
};

getPoolInfo();
