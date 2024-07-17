import { PublicKey } from "@solana/web3.js";
import { BoundPoolClient } from "../../src/bound-pool/BoundPoolClient";
import { connection } from "../common";

// yarn tsx examples/bonding-pool/get-meme-price-and-market-cap.ts > log.txt 2>&1
export const getMemePriceAndMarketCap = async () => {
  const poolAddress = new PublicKey("DE181NjdZdGTgvmYpkyewbETU6gSU3kqJC4WXKHbNxaR");
  const slerfPriceInUsd = 0.31;

  const pool = await BoundPoolClient.fetch2(connection, poolAddress);
  console.log("\npool:", pool);

  const prices = await BoundPoolClient.getMemePrice({ boundPoolInfo: pool, quotePriceInUsd: slerfPriceInUsd });
  console.log("\nprices:", prices);

  const marketCap = BoundPoolClient.getMemeMarketCap({ memePriceInUsd: prices.priceInUsd });
  console.log("marketCap:", marketCap);
};

getMemePriceAndMarketCap();
