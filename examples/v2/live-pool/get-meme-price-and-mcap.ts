import { PublicKey } from "@solana/web3.js";
import { clientV2, connection } from "../../common";
import { LivePoolClientV2 } from "../../../src";

const poolAddress = new PublicKey("4h1mxpkkh6PjLs71FxXRVBrEjBtknyiezgDu2pNVF2bc");
const quotePriceInUsd = 130;

// yarn tsx examples/v2/live-pool/get-meme-price-and-mcap.ts > log.txt 2>&1
async function getMemePriceAndMarketCap() {
  const livePoolClient = await LivePoolClientV2.fromAmmId(poolAddress, clientV2);
  const memePrice = await livePoolClient.getMemePrice({
    poolAddress: poolAddress.toString(),
    quotePriceInUsd,
    connection,
  });

  console.log(`Meme Price in Quote: ${memePrice.priceInQuote}`);
  console.log(`Meme Price in USD: ${memePrice.priceInUsd}`);
}

getMemePriceAndMarketCap().catch(console.error);
