import { ParseTx } from "../../src/tx-parsing/parsing";
import { client } from "../common";

// yarn tsx examples/parsing/parse-transaction.ts
(async () => {
  const signature = "5XrSyP8d489HmbVCExEXLSzGFShL9XbNCscS5quiRC9q8HiZVekCM2YtwpzSfsZeTT8uVvJc7WiTdnbnnhdccr34";

  const res = await ParseTx(signature, client);

  console.debug("res: ", res);
})();
