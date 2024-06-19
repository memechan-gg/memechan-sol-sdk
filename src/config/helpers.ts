import { PublicKey } from "@solana/web3.js";
import { TOKEN_INFOS } from "./config";
import { TokenInfo, TokenSymbol } from "./types";

export function getTokenInfoBySymbol(symbol: TokenSymbol): TokenInfo {
  return TOKEN_INFOS[symbol];
}

export function getTokenInfoByMint(mint: PublicKey): TokenInfo {
  const result = Object.values(TOKEN_INFOS).find((tokenInfo) => tokenInfo.mint.equals(mint));
  if (!result) {
    throw new Error(`Token not found: ${mint.toString()}`);
  }
  return result;
}
