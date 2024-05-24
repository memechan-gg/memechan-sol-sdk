import { BoundPoolClient } from "../../src/bound-pool/BoundPoolClient";
import { LivePool } from "../../src/live-pool/LivePool";
import { connection } from "../common";

// yarn tsx examples/live-pool/get-meme-price-and-mcap.ts > log.txt 2>&1
export const getMemePriceAndMarketCap = async () => {
  const poolAddress = "BY6xstuufxC7sii4iqYXToSzYrT8wBcLkrwrVatHXkQs";
  const memePrice = await LivePool.getMemePrice({ poolAddress, connection, quotePriceInUsd: 0.31 });
  console.log("memePrice:", memePrice);

  const marketCap = BoundPoolClient.getMemeMarketCap({ memePriceInUsd: memePrice.priceInUsd });
  console.log("marketCap:", marketCap);
};

getMemePriceAndMarketCap();
