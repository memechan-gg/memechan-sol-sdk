import { PRESALE_ADDRESS } from "../../src";
import { HeliusApiInstance, connection } from "../common";
import { saveDataToJsonFile } from "../utils";

// yarn tsx examples/helius-api/get-parsed-transactions-by-address.ts
(async () => {
  const signatureData = await HeliusApiInstance.getAllTransactionSingaturesByAddress({
    address: PRESALE_ADDRESS,
    connection,
  });
  console.debug("signatureData: ", signatureData);

  const res = await HeliusApiInstance.getAllParsedTransactions({ signatures: signatureData.txSignatureList });
  console.debug("res: ", res);

  saveDataToJsonFile(res, `tx-parsed-tx-data-for-pre-sale-address-${PRESALE_ADDRESS}`);
})();
