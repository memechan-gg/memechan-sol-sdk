/* eslint-disable @typescript-eslint/no-explicit-any */
import { EventEmitter } from "events";
import { RunningLineEventData } from "./types";
import {
  BE_URL,
  BoundPoolClientV2,
  ChartApi,
  LogNotification,
  MemechanClientV2,
  MetadataClient,
  parseTxV2,
  SolanaWsClient,
} from "..";

export class RunningLineEventEmitter extends EventEmitter {
  private seenSignatures: Set<string> = new Set();

  constructor(
    private wsClient: SolanaWsClient,
    private clientV2: MemechanClientV2,
  ) {
    super();
    this.wsClient.on("logNotification", this.handleLogNotification.bind(this));
  }

  private async handleLogNotification(log: LogNotification) {
    try {
      const signature = log.value.signature;
      if (this.seenSignatures.has(signature)) {
        return; // Skip already seen signatures
      }
      this.seenSignatures.add(signature);

      const transactionDetails = await parseTxV2(signature, this.clientV2);
      if (!transactionDetails) {
        console.error("Failed to parse transaction details for signature:", signature);
        return;
      }

      await this.processTransactionDetails(transactionDetails);
    } catch (e) {
      console.error("Failed to handle log notification:", e);
    }
  }

  private async processTransactionDetails(transactionDetails: any[]) {
    for (const detail of transactionDetails) {
      if (detail.type === "swap_y" || detail.type === "swap_x") {
        const eventData = await this.createEventData(detail);
        if (eventData) {
          this.emit(eventData.type, eventData);
        }
      }
    }
  }

  private async createEventData(detail: any): Promise<RunningLineEventData | null> {
    try {
      const boundPoolClient = await BoundPoolClientV2.fromBoundPoolId({
        client: this.clientV2,
        poolAccountAddressId: detail.poolAddr,
      });

      const metadataAddress = boundPoolClient.getMetadataAddress();
      const tokenMetadata = await MetadataClient.fetchMetadata(metadataAddress, this.clientV2.connection);

      if (!tokenMetadata) {
        console.error("Failed to fetch token metadata for address:", metadataAddress.toBase58());
        return null;
      }

      const memePrice = await this.fetchTokenPrice(boundPoolClient);

      const amount = detail.type === "swap_y" ? detail.baseAmtReceived : detail.baseAmtSwapped;
      return {
        type: detail.type === "swap_y" ? "buy" : "sell",
        tokenAddress: boundPoolClient.memeTokenMint.toBase58(),
        tokenTicker: tokenMetadata.mplMetadata.symbol,
        tokenImage: tokenMetadata.offchainMetadata.image,
        amount: amount,
        amountInUsd: parseFloat(memePrice.price) * amount,
        sender: detail.sender.toBase58(),
      };
    } catch (e) {
      console.error("Failed to create event data:", e);
      return null;
    }
  }

  private async fetchTokenPrice(boundPoolClient: BoundPoolClientV2): Promise<any> {
    const chartApi = new ChartApi(BE_URL);
    return await chartApi.getPrice({
      address: boundPoolClient.id.toBase58(),
      symbol: "USD",
      type: "seedPool",
    });
  }
}
