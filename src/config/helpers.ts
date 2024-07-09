import { PublicKey } from "@solana/web3.js";
import { DEFAULT_ON_CHAIN_ADDRESS, MEMECHAN_MEME_TOKEN_DECIMALS, MEMECHAN_PROGRAM_ID_V2, TOKEN_INFOS } from "./config";
import { TokenInfo, TokenSymbol } from "./types";

export function getTokenInfoBySymbol(symbol: TokenSymbol): TokenInfo {
  return TOKEN_INFOS[symbol];
}

export function getTokenInfoByMint(mint: PublicKey): TokenInfo {
  const result = Object.values(TOKEN_INFOS).find((tokenInfo) => tokenInfo.mint.equals(mint));
  if (!result) {
    return new TokenInfo({
      decimals: MEMECHAN_MEME_TOKEN_DECIMALS,
      mint: mint,
      name: "MEME",
      programId: new PublicKey(MEMECHAN_PROGRAM_ID_V2),
      symbol: "MEME",
      targetConfig: DEFAULT_ON_CHAIN_ADDRESS,
      targetConfigV2: DEFAULT_ON_CHAIN_ADDRESS,
    });
  }
  return result;
}
