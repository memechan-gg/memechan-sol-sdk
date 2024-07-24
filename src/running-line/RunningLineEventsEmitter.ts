/* eslint-disable @typescript-eslint/no-explicit-any */
import { EventEmitter } from "events";
import { BuySellEventData, ClaimUnstakeEventData } from "./types";
import {
  BE_URL,
  BoundPoolClientV2,
  ChartApi,
  findMetadataPDA,
  LogNotification,
  MemechanClientV2,
  MetadataClient,
  ParsedTransactionDetail,
  parseTxV2,
  SolanaWsClient,
  StakingPoolClientV2,
} from "..";
import {
  SwapYInstructionParsed,
  SwapXInstructionParsed,
  UnstakeInstructionParsed,
  WithdrawFeesInstructionParsed,
} from "../tx-parsing/v2/parsers";

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

  private async processTransactionDetails(transactionDetails: ParsedTransactionDetail[]) {
    for (const detail of transactionDetails) {
      switch (detail.type) {
        case "swap_y":
        case "swap_x": {
          const buySellEventData = await this.createBuySellEventData(detail);
          if (buySellEventData) {
            this.emit(buySellEventData.type, buySellEventData);
          }
          break;
        }
        case "unstake":
        case "withdrawFees": {
          const claimUnstakeEventData = await this.createClaimUnstakeEventData(detail);
          if (claimUnstakeEventData) {
            this.emit(claimUnstakeEventData.type, claimUnstakeEventData);
          }
          break;
        }
        default:
          console.warn("Unhandled transaction type:", detail.type);
      }
    }
  }

  private async createBuySellEventData(
    detail: SwapYInstructionParsed | SwapXInstructionParsed,
  ): Promise<BuySellEventData | null> {
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
      console.error("Failed to create buy/sell event data:", e);
      return null;
    }
  }

  private async createClaimUnstakeEventData(
    detail: UnstakeInstructionParsed | WithdrawFeesInstructionParsed,
  ): Promise<ClaimUnstakeEventData | null> {
    if (detail.type !== "unstake" && detail.type !== "withdrawFees") return null;
    try {
      const tokenPrices = await this.fetchTokenPrices();
      const memePrice = tokenPrices.memePrice;
      const quotePrice = tokenPrices.quotePrice;
      const chanPrice = tokenPrices.chanPrice;

      let memeAmount = 0;
      let quoteAmount = 0;
      let chanAmount = 0;

      const stakingPoolClient = await StakingPoolClientV2.fromStakingPoolId({
        client: this.clientV2,
        poolAccountAddressId: detail.stakingPoolAddress,
      });

      const tokenMint = stakingPoolClient.memeMint;

      if (detail.type === "unstake") {
        memeAmount = detail.unstakedMeme;
        quoteAmount = detail.unstakedQuote;
        chanAmount = detail.unstakedChan;
      } else if (detail.type === "withdrawFees") {
        memeAmount = detail.feesMeme;
        quoteAmount = detail.feesQuote;
        chanAmount = detail.feesChan;
      }

      const metadataAddress = await findMetadataPDA(tokenMint);
      const tokenMetadata = await MetadataClient.fetchMetadata(metadataAddress, this.clientV2.connection);

      if (!tokenMetadata) {
        console.error("Failed to fetch token metadata for address:", metadataAddress.toBase58());
        return null;
      }

      return {
        type: detail.type === "unstake" ? "unstake" : "claim",
        tokenAddress: tokenMint.toBase58(),
        tokenTicker: tokenMetadata.mplMetadata.symbol,
        tokenImage: tokenMetadata.offchainMetadata.image,
        sender: detail.sender.toBase58(),
        memeAmount: memeAmount,
        memeAmountInUsd: memeAmount * memePrice,
        quoteAmount: quoteAmount,
        quoteAmountInUsd: quoteAmount * quotePrice,
        chanAmount: chanAmount,
        chanAmountInUsd: chanAmount * chanPrice,
      };
    } catch (e) {
      console.error("Failed to create claim/unstake event data:", e);
      return null;
    }
  }

  private async fetchTokenPrices(): Promise<any> {
    const chartApi = new ChartApi(BE_URL);
    const memePrice = await chartApi.getPrice({ address: "memeTokenAddress", symbol: "USD", type: "seedPool" });
    const quotePrice = await chartApi.getPrice({ address: "quoteTokenAddress", symbol: "USD", type: "seedPool" });
    const chanPrice = await chartApi.getPrice({ address: "chanTokenAddress", symbol: "USD", type: "seedPool" });
    return {
      memePrice: parseFloat(memePrice.price),
      quotePrice: parseFloat(quotePrice.price),
      chanPrice: parseFloat(chanPrice.price),
    };
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
