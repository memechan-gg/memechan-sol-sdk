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
  private cooldownPeriod: number;

  constructor(endpoints: string[]) {
    super(endpoints[0]);
    this.endpoints = endpoints;
    this.currentIndex = 0;
    this.failingEndpoints = new Map();
    this.cooldownPeriod = 5 * 60 * 1000; // 5 mins
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
      if (!this.failingEndpoints.has(endpoint) || now - this.failingEndpoints.get(endpoint)! > this.cooldownPeriod) {
        return endpoint;
      }
    }
    throw new Error("All endpoints are in cooldown period.");
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
      }
    }
    throw lastError;
  }
}
