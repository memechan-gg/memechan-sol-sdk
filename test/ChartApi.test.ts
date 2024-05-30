import { ChartApi } from "../src/api/ChartApi";
import { BE_URL } from "./utils";

export function test() {
  describe("Charts API", () => {
    // Using pool address as input
    it("getChart (pool address)", async () => {
      const api = new ChartApi(BE_URL);
      console.log(
        "GET CHART",
        await api.getChart({
          address: "78nBXvVnHeKvFu4oWdcZwcWgtuXEzcmv8scrweiNjALd",
          symbol: "SLERF",
          from: "0",
          to: "1716642015175",
          resolution: "5m",
        }),
      );
    });

    it("getPrice (pool address)", async () => {
      const api = new ChartApi(BE_URL);
      console.log(
        "GET PRICE",
        await api.getPrice({
          address: "78nBXvVnHeKvFu4oWdcZwcWgtuXEzcmv8scrweiNjALd",
          symbol: "SLERF",
          type: "seedPool",
        }),
      );
    });

    it("updatePrice (pool address)", async () => {
      const api = new ChartApi(BE_URL);
      console.log(
        "GET PRICE",
        await api.updatePrice({
          address: "78nBXvVnHeKvFu4oWdcZwcWgtuXEzcmv8scrweiNjALd",
          type: "seedPool",
        }),
      );
    });

    // Using token address as input
    it("getChart (token address)", async () => {
      const api = new ChartApi(BE_URL);
      console.log(
        "GET CHART",
        await api.getChart({
          address: "5gTdveThDJG93wQp2oiTSMoDLR87mMvAGRzEkQ3S8Aa1",
          symbol: "SLERF",
          from: "0",
          to: "1716642015175",
          resolution: "5m",
        }),
      );
    });

    it("getPrice (token address)", async () => {
      const api = new ChartApi(BE_URL);
      console.log(
        "GET PRICE",
        await api.getPrice({
          address: "5gTdveThDJG93wQp2oiTSMoDLR87mMvAGRzEkQ3S8Aa1",
          symbol: "SLERF",
          type: "seedPool",
        }),
      );
    });

    it("updatePrice (token address)", async () => {
      const api = new ChartApi(BE_URL);
      console.log(
        "GET PRICE",
        await api.updatePrice({
          address: "5gTdveThDJG93wQp2oiTSMoDLR87mMvAGRzEkQ3S8Aa1",
          type: "seedPool",
        }),
      );
    });
  });
}
