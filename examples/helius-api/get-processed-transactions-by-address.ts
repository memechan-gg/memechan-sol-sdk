import { PRESALE_ADDRESS } from "../../src";
import { HeliusApiInstance, connection } from "../common";
import { saveDataToJsonFile } from "../utils";

// yarn tsx examples/helius-api/get-processed-transactions-by-address.ts
(async () => {
  const signatureData = await HeliusApiInstance.getAllTransactionSingaturesByAddress({
    address: PRESALE_ADDRESS,
    connection,
  });

  console.debug("signatureData.txSignatureList: ", signatureData.txSignatureList);
  console.debug("signatureData.txSignatureListSize: ", signatureData.txSignatureListSize);

  const { parsedDataList, parsedDataListSize } = await HeliusApiInstance.getAllParsedTransactions({
    signatures: signatureData.txSignatureList,
  });

  console.debug("parsedDataList: ", parsedDataList);
  console.debug("parsedDataListSize: ", parsedDataListSize);

  const {
    aggregatedTxsByOwnerList,
    aggregatedTxsByOwnerListSize,
    aggregatedTxsByOwnerMap,
    filteredOutTxsDataByReason,
  } = HeliusApiInstance.processAllParsedTransactions({
    parsedTransactionsList: parsedDataList,
    targetAddress: PRESALE_ADDRESS.toString(),
    // TODO: Add timestampFrom and timestampTo
  });

  console.debug("aggregatedTxsByOwnerList: ", aggregatedTxsByOwnerList);
  console.debug("aggregatedTxsByOwnerListSize: ", aggregatedTxsByOwnerListSize);
  console.debug("aggregatedTxsByOwnerMap: ", aggregatedTxsByOwnerMap);
  console.debug("filteredOutTxsDataByReason: ", filteredOutTxsDataByReason);

  saveDataToJsonFile(aggregatedTxsByOwnerList, "aggregated-list-by-user-pre-sale-amount");
  saveDataToJsonFile(aggregatedTxsByOwnerMap, "aggregated-map-by-user-pre-sale-amount");
  saveDataToJsonFile(filteredOutTxsDataByReason, "filter-out-txs-data-by-reson");
})();
