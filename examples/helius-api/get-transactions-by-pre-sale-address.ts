import { PRESALE_ADDRESS } from "../../src";
import { HeliusApiInstance, connection } from "../common";
import { saveDataToJsonFile } from "../utils";

// yarn tsx examples/helius-api/get-transactions-by-pre-sale-address.ts
export const getTransactionByPreSaleAddressExample = async () => {
  const res = await HeliusApiInstance.getAllTransactionSingaturesByAddress({
    address: PRESALE_ADDRESS,
    connection,
  });

  saveDataToJsonFile(res.txSignatureList, `tx-signatures-for-pre-sale-address-${PRESALE_ADDRESS}`);

  console.debug("res: ", res);
};

getTransactionByPreSaleAddressExample();
