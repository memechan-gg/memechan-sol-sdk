import { Connection } from "@solana/web3.js";

export class LoadBalancedConnection extends Connection {
  private endpoints: string[];
  private currentIndex: number;
  private failingEndpoints: Map<string, number>;
  private cooldownPeriod: number;

  constructor(endpoints: string[]) {
    super(endpoints[0]);
    this.endpoints = endpoints;
    this.currentIndex = 0;
    this.failingEndpoints = new Map();
    this.cooldownPeriod = 5 * 60 * 1000; // 5 mins
    return new Proxy(this, {
      get: (target, prop, receiver) => {
        if (typeof prop === "string" && prop in Connection.prototype) {
          return async (...args: any[]) => {
            return target.retryWithNextEndpoint(prop, args);
          };
        }
        return Reflect.get(target, prop, receiver);
      },
    });
  }

  private getNextEndpoint(): string {
    const now = Date.now();
    for (let i = 0; i < this.endpoints.length; i++) {
      const endpoint = this.endpoints[this.currentIndex];
      this.currentIndex = (this.currentIndex + 1) % this.endpoints.length;
      if (!this.failingEndpoints.has(endpoint) || now - this.failingEndpoints.get(endpoint)! > this.cooldownPeriod) {
        return endpoint;
      }
    }
    throw new Error("All endpoints are in cooldown period.");
  }

  private async retryWithNextEndpoint(prop: string, args: any[]): Promise<any> {
    let lastError: any;
    for (let i = 0; i < this.endpoints.length; i++) {
      const endpoint = this.getNextEndpoint();
      const connection = new Connection(endpoint);
      try {
        return await (connection as any)[prop](...args);
      } catch (error) {
        lastError = error;
        console.error(`Failed with endpoint ${endpoint}:`, error);
        this.failingEndpoints.set(endpoint, Date.now());
      }
    }
    throw lastError;
  }
}
