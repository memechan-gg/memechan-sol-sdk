import { parseTxV2 } from "../../../src";
import { RunningLineClient } from "../../../src/running-line/runningLineClient";
import { clientV2, connection } from "../../common";

// yarn tsx examples/v2/running-line/running-line.ts
(async () => {
  const runningLineClient = new RunningLineClient(connection.rpcEndpoint.replace("http", "ws"));
  runningLineClient.on("swapY", async (log) => {
    // console.log("Event swapY detected:", log);
    console.log(await parseTxV2(log.value.signature, clientV2));
  });

  runningLineClient.on("swapX", async (log) => {
    // console.log("Event swapX detected:", log);
    console.log(await parseTxV2(log.value.signature, clientV2));
  });
  runningLineClient.start();
})();
