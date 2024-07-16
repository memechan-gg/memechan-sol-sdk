import { PublicKey } from "@solana/web3.js";
import { BoundPoolClientV2, LivePoolClientV2 } from "../../../src";
import { createMemeChanClientV2 } from "../../common";

const poolAddress = new PublicKey("69fywDppk1B9tXtGQJDiRKDcV8My6NLuyHgAmSToT6bZ");
const quotePriceInUsd = 130;

// yarn tsx examples/v2/live-pool/get-meme-price-and-mcap.ts > log.txt 2>&1
async function getMemePriceAndMarketCap() {

  const clientV2 = await createMemeChanClientV2();
  const livePoolClient = await LivePoolClientV2.fromAmmId(poolAddress, clientV2);

  const memePrice = await livePoolClient.getMemePrice({
    poolAddress: poolAddress.toString(),
    quotePriceInUsd,
    connection: clientV2.connection,
  });

  console.log(`Meme Price in Quote: ${memePrice.priceInQuote}`);
  console.log(`Meme Price in USD: ${memePrice.priceInUsd}`);

  const marketCap = BoundPoolClientV2.getMemeMarketCap({ memePriceInUsd: memePrice.priceInUsd });
  console.log("marketCap:", marketCap);
}

getMemePriceAndMarketCap().catch(console.error);
