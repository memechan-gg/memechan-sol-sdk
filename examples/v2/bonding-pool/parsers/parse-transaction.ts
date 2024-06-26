import { parseTxV2 } from "../../../../src/tx-parsing/v2/parsingV2";
import { clientV2 } from "../../../common";

// yarn tsx examples/parsing/parse-transaction.ts
(async () => {
  const signature = "5JsCySKtPdezhxQUnVsqXqgKrfcMbVC9i4Jzc3c9mq5FcahRskuQtcnTwLxQPYDeu7qqRZnCYMLC9TueLAsvKWSq";

  const res = await parseTxV2(signature, clientV2);

  console.debug("res: ", res);
})();
