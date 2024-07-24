import { z } from "zod";

export const chartsResolutions = z
  .literal("5m")
  .or(z.literal("10m"))
  .or(z.literal("15m"))
  .or(z.literal("1h"))
  .or(z.literal("1d"));

export const symbols = z.literal("USD").or(z.literal("SLERF")).or(z.literal("SOL"));

export const requestChartSchema = z.object({
  address: z.string(),
  symbol: symbols,
  resolution: chartsResolutions,
  from: z.string(),
  to: z.string(),
});

export const requestPriceSchema = z.object({
  address: z.string(),
  symbol: symbols,
  type: z.literal("seedPool").or(z.literal("livePool")),
});

export const updatePriceSchema = z.object({
  address: z.string(),
  type: z.literal("seedPool"),
});

export const ohlvcSchema = z.object({
  time: z.number(),
  open: z.string(),
  high: z.string(),
  low: z.string(),
  close: z.string(),
  volume: z.string(),
});

export const getBarsResponse = requestChartSchema.extend({
  bars: z.array(ohlvcSchema),
});

export const priceSnapshot = z.object({
  symbol: symbols,
  address: z.string(),
  time: z.number(),
  price: z.string(),
});

export type RequestChart = z.infer<typeof requestChartSchema>;
export type OHLCV = z.infer<typeof ohlvcSchema>;
export type GetBarsResponse = z.infer<typeof getBarsResponse>;
export type PriceSnapshot = z.infer<typeof priceSnapshot>;
export type ChartsResolution = z.infer<typeof chartsResolutions>;
export type Symbols = z.infer<typeof symbols>;
export type RequestPrice = z.infer<typeof requestPriceSchema>;
export type RequestUpdatePrice = z.infer<typeof updatePriceSchema>;
export type PriceResponse = { price: string };
