import { parseTxV2 } from "../../../src/tx-parsing/v2/parsingV2";
import { clientV2 } from "../../common";

// yarn tsx examples/v2/parsers/parse-transaction.ts
(async () => {
  const signature = "3u9Tsxx3C5DkRuiRFh62cV2igGtTyrrEJWEdLXy9jaS7L4KdGnjY6nUzoodaa52JN8rpVBFzuaxHtBN6PMQsLoco";

  const res = await parseTxV2(signature, clientV2);

  console.debug("res: ", res);
})();
