import { ChartApi, PROD_BE_URL } from "../../src";

// yarn tsx examples/api/getLivePoolPrice.ts > getLivePoolPrice.txt 2>&1
export async function getLivePoolPrice() {
  const api = new ChartApi(PROD_BE_URL);
  console.log(
    "GET PRICE",
    await api.getPrice({
      address: "Cq7tKjeic5c4YFZPsvCskGQRYCqGbyGMVjqL1ud1hVaL",
      symbol: "SLERF",
      type: "livePool",
    }),
  );
}

getLivePoolPrice();
