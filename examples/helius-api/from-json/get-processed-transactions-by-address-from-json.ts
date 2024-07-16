import { PRESALE_ADDRESS } from "../../../src/config/consts";
import { TransactionDataByDigest } from "../../../src/helius-api/typeguards/txTypeguard";
import { HeliusApiInstance } from "../../common";
import { readDataFromJsonFile, saveDataToJsonFile } from "../../utils";

// yarn tsx examples/helius-api/from-json/get-processed-transactions-by-address-from-json.ts > log.txt 2>&1
(async () => {
  const parsedDataList: TransactionDataByDigest[] = (await readDataFromJsonFile(
    "tx-parsed-tx-data-for-pre-sale-address-AXen9e3RFS46k8n29TLsUc65ngnyPCB6L2pazyLZQEX5",
  )) as TransactionDataByDigest[];

  console.debug("parsedDataList: ", parsedDataList);

  const {
    aggregatedTxsByOwnerList,
    aggregatedTxsByOwnerListSize,
    aggregatedTxsByOwnerMap,
    notAggregatedByOwnerList,
    filteredOutTxsDataByReason,
  } = HeliusApiInstance.processAllParsedTransactions({
    parsedTransactionsList: parsedDataList,
    targetAddress: PRESALE_ADDRESS.toString(),
    // TODO: Add timestampFrom and timestampTo
  });

  // console.debug("aggregatedTxsByOwnerList: ", aggregatedTxsByOwnerList);
  // console.debug("aggregatedTxsByOwnerMap: ", aggregatedTxsByOwnerMap);
  // console.debug("filteredOutTxsDataByReason: ", filteredOutTxsDataByReason);
  console.debug("aggregatedTxsByOwnerListSize: ", aggregatedTxsByOwnerListSize);

  saveDataToJsonFile(notAggregatedByOwnerList, "not-aggregated-list-pre-sale-amount");
  saveDataToJsonFile(aggregatedTxsByOwnerList, "aggregated-list-by-user-pre-sale-amount");
  saveDataToJsonFile(aggregatedTxsByOwnerMap, "aggregated-map-by-user-pre-sale-amount");
  saveDataToJsonFile(filteredOutTxsDataByReason, "filter-out-txs-data-by-reson");
})();
