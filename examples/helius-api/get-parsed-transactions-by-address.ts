import { PRESALE_ADDRESS } from "../../src";
import { HeliusApiInstance, connection } from "../common";
import { saveDataToJsonFile } from "../utils";

// yarn tsx examples/helius-api/get-parsed-transactions-by-address.ts > log-1.txt 2>&1
(async () => {
  const signatureData = await HeliusApiInstance.getAllTransactionSingaturesByAddress({
    address: PRESALE_ADDRESS,
    connection,
  });

  // console.debug("signatureData.txSignatureList: ", signatureData.txSignatureList);
  console.debug("signatureData.txSignatureListSize: ", signatureData.txSignatureListSize);

  const { parsedDataList, parsedDataListSize } = await HeliusApiInstance.getAllParsedTransactions({
    signatures: signatureData.txSignatureList,
  });

  // console.debug("parsedDataList: ", parsedDataList);
  console.debug("parsedDataListSize: ", parsedDataListSize);

  saveDataToJsonFile(parsedDataList, `tx-parsed-tx-data-for-pre-sale-address-${PRESALE_ADDRESS}`);
})();
