import { SolanaWsClient, RunningLineEventEmitter, RunningLineEventData } from "../../../src";
import { clientV2, connection } from "../../common";

// yarn tsx examples/v2/running-line/running-line.ts
(async () => {
  const wsUrl = connection.rpcEndpoint.replace("http", "ws");
  const solanaWsClient = new SolanaWsClient(wsUrl);
  const runningLineEventEmitter = new RunningLineEventEmitter(solanaWsClient, clientV2);

  runningLineEventEmitter.on("buy", (event: RunningLineEventData) => {
    console.log("Buy event detected:", event);
  });

  runningLineEventEmitter.on("sell", (event: RunningLineEventData) => {
    console.log("Sell event detected:", event);
  });

  solanaWsClient.start();
})();
