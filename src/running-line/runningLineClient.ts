import WebSocket from "ws";
import { EventEmitter } from "events";
import { MEMECHAN_PROGRAM_ID_V2 } from "../config/config";
import { LogNotification, WebSocketMessage } from "./types";

export class RunningLineClient extends EventEmitter {
  private ws: WebSocket | null = null;
  private pingInterval: NodeJS.Timeout | null = null;
  private seenSignatures: Set<string> = new Set();

  constructor(private wsUrl: string) {
    super();
    console.log("RunningLineClient created. wsUrl:", this.wsUrl);
  }

  start() {
    if (!this.ws) {
      this.ws = new WebSocket(`${this.wsUrl}`);
      this.setupWebSocket(this.ws);
      console.log("RunningLineClient started");
    }
  }

  stop() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
      if (this.pingInterval) {
        clearInterval(this.pingInterval);
        this.pingInterval = null;
      }
      console.log("RunningLineClient stopped");
    }
  }

  private setupWebSocket(ws: WebSocket) {
    ws.on("open", this.handleOpen.bind(this));
    ws.on("message", this.handleMessage.bind(this));
    ws.on("error", this.handleError.bind(this));
    ws.on("close", this.handleClose.bind(this));
  }

  private handleOpen() {
    console.log("WebSocket is open");
    this.sendLogsSubscribeRequest();
    this.startPing();
  }

  private handleMessage(data: WebSocket.Data) {
    const messageStr = data.toString();
    try {
      const messageObj: WebSocketMessage = JSON.parse(messageStr);
      if (messageObj.method === "logsNotification") {
        this.handleLogNotification(messageObj.params.result);
      } else {
        console.log("Received:", messageObj);
      }
    } catch (e) {
      console.error("Failed to parse JSON:", e);
    }
  }

  private handleError(event: WebSocket.ErrorEvent) {
    console.error("WebSocket error:", event);
  }

  private handleClose() {
    console.log("WebSocket is closed");
    if (this.pingInterval) {
      clearInterval(this.pingInterval);
      this.pingInterval = null;
    }
    this.ws = null;
  }

  private sendLogsSubscribeRequest() {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      const request = {
        jsonrpc: "2.0",
        id: 1,
        method: "logsSubscribe",
        params: [
          {
            mentions: [MEMECHAN_PROGRAM_ID_V2],
          },
          {
            commitment: "finalized",
          },
        ],
      };
      this.ws.send(JSON.stringify(request));
    }
  }

  private startPing() {
    this.pingInterval = setInterval(() => {
      if (this.ws && this.ws.readyState === WebSocket.OPEN) {
        this.ws.ping(); // `ping` is specific to `ws` in Node.js
        console.log("Ping sent");
      }
    }, 30000); // Ping every 30 seconds
  }

  private handleLogNotification(log: LogNotification) {
    try {
      const signature = log.value.signature;
      if (this.seenSignatures.has(signature)) {
        return; // Skip already seen signatures
      }
      this.seenSignatures.add(signature);

      const logs = log.value.logs;
      const swapYLog = logs.find((log: string) => log.includes("Instruction: SwapY"));
      const swapXLog = logs.find((log: string) => log.includes("Instruction: SwapX"));

      if (swapYLog) {
        // console.log("SwapY transaction detected:", log);
        this.emit("swapY", log);
      }

      if (swapXLog) {
        // console.log("SwapX transaction detected:", log);
        this.emit("swapX", log);
      }
    } catch (e) {
      console.error("Failed to handle log notification:", e);
    }
  }
}
