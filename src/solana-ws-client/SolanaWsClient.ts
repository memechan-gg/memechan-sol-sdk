import WebSocket from "ws";
import { EventEmitter } from "events";
import { MEMECHAN_PROGRAM_ID_V2 } from "../config/config";
import { WebSocketMessage } from "./types";

export class SolanaWsClient extends EventEmitter {
  private ws: WebSocket | null = null;
  private pingInterval: NodeJS.Timeout | null = null;
  private reconnectAttempts = 0;
  private readonly maxReconnectAttempts = 5;
  private readonly reconnectInterval = 5000;

  constructor(private wsUrl: string) {
    super();
    console.log("SolanaWsClient created. wsUrl:", this.wsUrl);
  }

  start() {
    if (!this.ws) {
      this.connectWebSocket();
      console.log("SolanaWsClient started");
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
      console.log("SolanaWsClient stopped");
    }
  }

  private connectWebSocket() {
    this.ws = new WebSocket(`${this.wsUrl}`);
    this.setupWebSocket(this.ws);
  }

  private attemptReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      console.log(`Reconnection attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts}...`);
      setTimeout(() => {
        this.connectWebSocket();
      }, this.reconnectInterval);
    } else {
      console.error("Max reconnect attempts reached. Giving up.");
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
    this.reconnectAttempts = 0;
    this.sendLogsSubscribeRequest();
    this.startPing();
  }

  private handleMessage(data: WebSocket.Data) {
    const messageStr = data.toString();
    try {
      const messageObj: WebSocketMessage = JSON.parse(messageStr);
      if (messageObj.method === "logsNotification") {
        this.emit("logNotification", messageObj.params.result);
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
    this.attemptReconnect();
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
            commitment: "commited",
          },
        ],
      };
      this.ws.send(JSON.stringify(request));
    }
  }

  private startPing() {
    this.pingInterval = setInterval(() => {
      if (this.ws && this.ws.readyState === WebSocket.OPEN) {
        this.ws.ping();
        console.log("Ping sent");
      }
    }, 30000); // Ping every 30 seconds
  }
}
