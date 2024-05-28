/* eslint-disable @typescript-eslint/no-explicit-any */
import { Connection } from "@solana/web3.js";

type ConnectionMethod = {
  [K in keyof Connection]: Connection[K] extends (...args: any) => any ? K : never;
}[keyof Connection];

type ConnectionMethodArgs<T extends ConnectionMethod> = T extends keyof Connection
  ? Connection[T] extends (...args: any) => any
    ? Parameters<Connection[T]>
    : never
  : never;

type ConnectionMethodReturn<T extends ConnectionMethod> = T extends keyof Connection
  ? Connection[T] extends (...args: any) => any
    ? ReturnType<Connection[T]>
    : never
  : never;

function isConnectionMethod(prop: string | symbol): prop is ConnectionMethod {
  return (
    typeof prop === "string" &&
    prop in Connection.prototype &&
    typeof (Connection.prototype as any)[prop] === "function"
  );
}

export class LoadBalancedConnection extends Connection {
  private endpoints: string[];
  private currentIndex: number;
  private failingEndpoints: Map<string, number>;
  private usageCount: Map<string, number>;
  private cooldownPeriod: number;
  private maxUsageCount: number;

  constructor(endpoints: string[]) {
    super(endpoints[0]);
    this.endpoints = endpoints;
    this.currentIndex = 0;
    this.failingEndpoints = new Map();
    this.usageCount = new Map();
    this.cooldownPeriod = 10 * 1000; // 10 seconds
    this.maxUsageCount = 10; // Max usage count before pushing to the end
    return new Proxy(this, {
      get: (target, prop, receiver) => {
        if (isConnectionMethod(prop)) {
          const method = prop as ConnectionMethod;
          return async (...args: ConnectionMethodArgs<typeof method>) => {
            return target.retryWithNextEndpoint(method, args);
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
      const usageCount = this.usageCount.get(endpoint) || 0;
      if (
        (!this.failingEndpoints.has(endpoint) || now - this.failingEndpoints.get(endpoint)! > this.cooldownPeriod) &&
        usageCount < this.maxUsageCount
      ) {
        this.usageCount.set(endpoint, usageCount + 1);
        return endpoint;
      } else if (usageCount >= this.maxUsageCount) {
        this.endpoints.push(this.endpoints.splice(this.currentIndex - 1, 1)[0]);
        this.usageCount.set(endpoint, 0);
        this.currentIndex--;
      }
    }
    throw new Error("All endpoints are in cooldown period or have reached max usage count.");
  }

  private async retryWithNextEndpoint<T extends ConnectionMethod>(
    prop: T,
    args: ConnectionMethodArgs<T>,
  ): Promise<ConnectionMethodReturn<T>> {
    let lastError: any;
    for (let i = 0; i < this.endpoints.length; i++) {
      const endpoint = this.getNextEndpoint();
      const connection = new Connection(endpoint);
      try {
        const method = connection[prop];
        if (typeof method === "function") {
          // Use a type assertion to set the `this` context for the method
          return (await (method as any).apply(connection, args)) as ConnectionMethodReturn<T>;
        } else {
          throw new Error(`Property ${prop} is not a function on Connection`);
        }
      } catch (error) {
        lastError = error;
        console.error(`Failed with endpoint ${endpoint}:`, error);
        this.failingEndpoints.set(endpoint, Date.now());

        // Push failing endpoint to the end of the list
        const index = this.endpoints.indexOf(endpoint);
        if (index > -1) {
          this.endpoints.push(this.endpoints.splice(index, 1)[0]);
        }
      }
    }
    throw lastError;
  }
}
