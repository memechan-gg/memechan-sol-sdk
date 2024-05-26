import { ChartApi } from "../src/api/ChartApi";
import { BE_URL } from "./utils";

describe("Charts API", () => {
  test("getChart", async () => {
    const api = new ChartApi(BE_URL);
    console.log(
      "GET CHART",
      await api.getChart({
        address: "9yNaVhmMFiwTkPcBRLcgyHnq8zZEKfg8MDZhsDXiwuQi",
        symbol: "SLERF",
        from: "0",
        to: "1716642015175",
        resolution: "5m",
      }),
    );
  });

  test("getPrice", async () => {
    const api = new ChartApi(BE_URL);
    console.log(
      "GET PRICE",
      await api.getPrice({
        address: "9yNaVhmMFiwTkPcBRLcgyHnq8zZEKfg8MDZhsDXiwuQi",
        symbol: "SLERF",
        type: "seedPool",
      }),
    );
  });
});
