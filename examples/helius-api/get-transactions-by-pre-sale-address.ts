import { PRESALE_ADDRESS } from "../../src";
import { HeliusApiInstance, connection } from "../common";

// yarn tsx examples/helius-api/get-transactions-by-pre-sale-address.ts
export const getTransactionByPreSaleAddressExample = async () => {
  const res = await HeliusApiInstance.getAllTransactionSingaturesByAddress({
    address: PRESALE_ADDRESS,
    connection,
  });

  console.debug("res: ", res);
};

getTransactionByPreSaleAddressExample();
