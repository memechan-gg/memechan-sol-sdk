import { QUOTE_TOKEN_CONFIGS } from "./config";
import { TokenConfig, TokenSymbol } from "./types";

export function getTokenConfig(symbol: TokenSymbol): TokenConfig | undefined {
  return QUOTE_TOKEN_CONFIGS[symbol];
}
