import { parseTx } from "../../src/tx-parsing/parsing";
import { client } from "../common";

// yarn tsx examples/parsing/parse-transaction.ts
(async () => {
  const signature = "5JsCySKtPdezhxQUnVsqXqgKrfcMbVC9i4Jzc3c9mq5FcahRskuQtcnTwLxQPYDeu7qqRZnCYMLC9TueLAsvKWSq";

  const res = await parseTx(signature, client);

  console.debug("res: ", res);
})();
