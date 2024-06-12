import { PRESALE_ADDRESS } from "../../../src";
import { TransactionDataByDigest } from "../../../src/helius-api/typeguards/txTypeguard";
import { HeliusApiInstance } from "../../common";
import { readDataFromJsonFile, saveDataToJsonFile } from "../../utils";

// yarn tsx examples/helius-api/from-json/get-applied-bonus-data.ts > log.txt 2>&1
(async () => {
  const parsedDataList: TransactionDataByDigest[] = (await readDataFromJsonFile(
    "tx-parsed-tx-data-for-pre-sale-address-AXen9e3RFS46k8n29TLsUc65ngnyPCB6L2pazyLZQEX5",
  )) as TransactionDataByDigest[];

  console.debug("parsedDataList: ", parsedDataList);

  const { aggregatedTxsByOwnerList } = await HeliusApiInstance.processAllParsedTransactions({
    parsedTransactionsList: parsedDataList,
    targetAddress: PRESALE_ADDRESS.toString(),
    // TODO: Add timestampFrom and timestampTo
  });

  const bonusListRaw = await readDataFromJsonFile("bonus-list");
  if (!bonusListRaw) {
    throw new Error("empty bonus list");
  }

  const bonusSignatureList = Object.keys(bonusListRaw);

  const { bonusAppliedData } = await HeliusApiInstance.getAppliedBonusDataByUser({
    aggregatedListByUserAmounts: aggregatedTxsByOwnerList,
    bonusSignatureList,
  });

  // console.debug("aggregatedTxsByOwnerList: ", aggregatedTxsByOwnerList);
  // console.debug("aggregatedTxsByOwnerMap: ", aggregatedTxsByOwnerMap);
  // console.debug("filteredOutTxsDataByReason: ", filteredOutTxsDataByReason);
  console.debug("aggregatedTxsByOwnerListSize: ", bonusAppliedData.length);

  saveDataToJsonFile(bonusAppliedData, "get-applied-bonus-data");
})();
