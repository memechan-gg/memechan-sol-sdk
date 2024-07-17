import { BE_URL } from "../config/config";
import { jsonFetch } from "../util/fetch";
import { GetBarsResponse, PriceResponse, RequestChart, RequestPrice, RequestUpdatePrice } from "./schemas/chart-schema";

export class ChartApi {
  constructor(private url = BE_URL) {}

  getChart(params: RequestChart): Promise<GetBarsResponse> {
    const queryParams = new URLSearchParams(params as Record<string, string>);
    return jsonFetch(`${this.url}/chart?${queryParams.toString()}`, {
      method: "GET",
    });
  }

  getPrice(params: RequestPrice): Promise<PriceResponse> {
    const queryParams = new URLSearchParams(params as Record<string, string>);
    return jsonFetch(`${this.url}/price?${queryParams.toString()}`, {
      method: "GET",
    });
  }
  updatePrice(params: RequestUpdatePrice): Promise<PriceResponse> {
    return jsonFetch(`${this.url}/chart/swap`, {
      method: "PUT",
      body: {
        ...params,
      },
    });
  }
}
