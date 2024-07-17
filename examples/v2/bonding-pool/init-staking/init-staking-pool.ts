import { PublicKey } from "@solana/web3.js";
import { clientV2, payer } from "../../../common";
import { BoundPoolClientV2 } from "../../../../src/bound-pool/BoundPoolClientV2";

// yarn tsx examples/v2/bonding-pool/init-staking/init-staking-pool.ts
(async () => {
  const poolAccountAddressId = new PublicKey("AJK4829mqJ7C45Bt7ejsyLM4YQuXExnuaRS2ac9mjHuB");
  const boundPoolInstance = await BoundPoolClientV2.fromBoundPoolId({ client: clientV2, poolAccountAddressId });

  console.debug("boundPoolInstance: ", boundPoolInstance);
  const result = await boundPoolInstance.initStakingPool({
    boundPoolInfo: boundPoolInstance.poolObjectData,
    payer: payer,
    user: payer,
    pool: poolAccountAddressId,
  });

  console.log("init-staking pool result: ", result);
})();
