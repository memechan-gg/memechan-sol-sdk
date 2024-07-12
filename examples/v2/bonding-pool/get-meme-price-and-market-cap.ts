import { PublicKey } from "@solana/web3.js";
import { BoundPoolClientV2 } from "../../../src";
import { clientV2, connection } from "../../common";

// yarn tsx examples/v2/bonding-pool/get-meme-price-and-market-cap.ts > log.txt 2>&1
export const getMemePriceAndMarketCap = async () => {
  const poolAddress = new PublicKey("Hw7PFpqLpKB9K1Wc9KLDPRV46BK7bUfhkGzM8dEiPX3");
  const slerfPriceInUsd = 135;

  const pool = await BoundPoolClientV2.fetch2(connection, poolAddress);
  console.log("\npool:", pool);

  const initialPrices = await BoundPoolClientV2.getInitialMemePrice({
    boundPoolInfo: pool,
    quotePriceInUsd: slerfPriceInUsd,
    client: clientV2,
  });
  console.log("\ninitialPrices:", initialPrices);

  const prices = await BoundPoolClientV2.getMemePrice({
    boundPoolInfo: pool,
    quotePriceInUsd: slerfPriceInUsd,
    client: clientV2,
  });
  console.log("\nprices:", prices);

  const marketCap = BoundPoolClientV2.getMemeMarketCap({ memePriceInUsd: prices.priceInUsd });
  console.log("marketCap:", marketCap);
};

getMemePriceAndMarketCap();
