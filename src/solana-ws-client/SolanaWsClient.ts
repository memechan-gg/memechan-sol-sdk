/* eslint-disable @typescript-eslint/no-explicit-any */
import { EventEmitter } from "events";
import { MEMECHAN_PROGRAM_ID_V2 } from "../config/config";
import { WebSocketMessage } from "./types";
import WebSocket from "isomorphic-ws";

// Define types for WebSocket and Interval
type IntervalType = ReturnType<typeof setInterval> | null;

export class SolanaWsClient extends EventEmitter {
  private ws: WebSocket | null = null;
  private pingInterval: IntervalType = null;
  private reconnectAttempts = 0;
  private readonly maxReconnectAttempts = 5;
  private readonly reconnectInterval = 5000;

  constructor(private wsUrl: string) {
    super();
    console.log("SolanaWsClient created. wsUrl:", this.wsUrl);
  }

  start(): void {
    if (!this.ws) {
      this.connectWebSocket();
      console.log("SolanaWsClient started");
    }
  }

  stop(): void {
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

  private connectWebSocket(): void {
    this.ws = new WebSocket(this.wsUrl);
    if (!this.ws) {
      console.error("Failed to create WebSocket");
      return;
    }
    this.setupWebSocket(this.ws);
  }

  private attemptReconnect(): void {
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

  private setupWebSocket(ws: WebSocket): void {
    ws.onopen = this.handleOpen.bind(this);
    ws.onmessage = this.handleMessage.bind(this);
    ws.onerror = this.handleError.bind(this);
    ws.onclose = this.handleClose.bind(this);
  }

  private handleOpen(): void {
    console.log("WebSocket is open");
    this.reconnectAttempts = 0;
    this.sendLogsSubscribeRequest();
    this.startPing();
  }

  private handleMessage(event: WebSocket.MessageEvent): void {
    const messageStr = event.data.toString();
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

  private handleError(event: WebSocket.ErrorEvent): void {
    console.error("WebSocket error:", event);
  }

  private handleClose(): void {
    console.log("WebSocket is closed");
    if (this.pingInterval) {
      clearInterval(this.pingInterval);
      this.pingInterval = null;
    }
    this.ws = null;
    this.attemptReconnect();
  }

  private sendLogsSubscribeRequest(): void {
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
            commitment: "confirmed",
          },
        ],
      };
      this.ws.send(JSON.stringify(request));
    }
  }

  private startPing(): void {
    this.pingInterval = setInterval(() => {
      if (this.ws && this.ws.readyState === WebSocket.OPEN) {
        this.ws.send(JSON.stringify({ type: "ping" }));
        console.log("Ping sent");
      }
    }, 30000); // Ping every 30 seconds
  }
}
