import { BoundPoolClient } from "../../src/bound-pool/BoundPoolClient";
import { LivePoolClient } from "../../src/live-pool/LivePoolClient";
import { connection } from "../common";

// yarn tsx examples/live-pool/get-meme-price-and-mcap.ts > log.txt 2>&1
export const getMemePriceAndMarketCap = async () => {
  const poolAddress = "GvRAuPrbff7Pa95DqNMKnuGybMjt43nBJE4gMSKqtiiT";
  const memePrice = await LivePoolClient.getMemePrice({ poolAddress, connection, quotePriceInUsd: 0.31 });
  console.log("memePrice:", memePrice);

  const marketCap = BoundPoolClient.getMemeMarketCap({ memePriceInUsd: memePrice.priceInUsd });
  console.log("marketCap:", marketCap);
};

getMemePriceAndMarketCap();
