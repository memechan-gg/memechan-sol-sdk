export type Log = string;

export interface LogNotification {
  context: {
    slot: number;
  };
  value: {
    signature: string;
    err: null | object;
    logs: Log[];
  };
}

export interface WebSocketMessage {
  jsonrpc: string;
  method: string;
  params: {
    result: LogNotification;
  };
}
