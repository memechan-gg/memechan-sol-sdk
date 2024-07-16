/* eslint-disable max-len */
import { BoundPoolClientV2 } from "../../../src";
import { createMemeChanClientV2, payer } from "../../common";

// yarn tsx examples/v2/bonding-pool/transfer-creator-funds.ts
(async () => {
  const clientV2 = await createMemeChanClientV2();

  const signature = await BoundPoolClientV2.transferCreatorBonusChanFunds({
    amount: BigInt(1000),
    connection: clientV2.connection,
    creator: payer.publicKey,
    payer: payer,
  });

  console.log("transferCreatorBonusChanFunds signature", signature);
})();
