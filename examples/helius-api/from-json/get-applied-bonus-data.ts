import { DECIMALS_S, PRESALE_ADDRESS } from "../../../src";
import { TransactionDataByDigest } from "../../../src/helius-api/typeguards/txTypeguard";
import { HeliusApiInstance } from "../../common";
import { readDataFromJsonFile, saveDataToJsonFile } from "../../utils";

// yarn tsx examples/helius-api/from-json/get-applied-bonus-data.ts > log.txt 2>&1
(async () => {
  const parsedDataList: TransactionDataByDigest[] = (await readDataFromJsonFile(
    "tx-parsed-tx-data-for-pre-sale-address-AXen9e3RFS46k8n29TLsUc65ngnyPCB6L2pazyLZQEX5",
  )) as TransactionDataByDigest[];

  console.debug("parsedDataList: ", parsedDataList);

  const { aggregatedTxsByOwnerList } = HeliusApiInstance.processAllParsedTransactions({
    parsedTransactionsList: parsedDataList,
    targetAddress: PRESALE_ADDRESS.toString(),
    // TODO: Add timestampFrom and timestampTo
  });

  const bonusListRaw = await readDataFromJsonFile("bonus-list");
  if (!bonusListRaw) {
    throw new Error("empty bonus list");
  }

  const bonusSignatureList = Object.keys(bonusListRaw);

  const { bonusAppliedData } = HeliusApiInstance.getAppliedBonusDataByUser({
    aggregatedListByUserAmounts: aggregatedTxsByOwnerList,
    bonusSignatureList,
  });
  console.debug("aggregatedTxsByOwnerListSize: ", bonusAppliedData.length);

  const { userPercentages, totalAmountExcludingBonus, totalAmountInludingBonus } =
    HeliusApiInstance.calculateUserPercentages(bonusAppliedData);

  console.debug(`Total amount (including bonus) (raw): ${totalAmountInludingBonus.toString()}`);
  console.debug(`Total amount (excluding bonus) (raw): ${totalAmountExcludingBonus.toString()}`);

  console.debug(`Total amount (including bonus) (SOL): ${totalAmountInludingBonus.dividedBy(DECIMALS_S).toString()}`);
  console.debug(`Total amount (excluding bonus) (SOL): ${totalAmountExcludingBonus.dividedBy(DECIMALS_S).toString()}`);

  saveDataToJsonFile(bonusAppliedData, "get-applied-bonus-data");
  saveDataToJsonFile(userPercentages, "users-percentages-data");
})();
