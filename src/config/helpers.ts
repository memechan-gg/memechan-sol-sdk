import { PublicKey } from "@solana/web3.js";
import { MEMECHAN_PROGRAM_ID_V2, MEME_TOKEN_DECIMALS, NATIVE_MINT, TOKEN_INFOS } from "./config";
import { TokenInfo, TokenSymbol } from "./types";

export function getTokenInfoBySymbol(symbol: TokenSymbol): TokenInfo {
  return TOKEN_INFOS[symbol];
}

export function getTokenInfoByMint(mint: PublicKey): TokenInfo {
  const result = Object.values(TOKEN_INFOS).find((tokenInfo) => tokenInfo.mint.equals(mint));
  if (!result) {
    return new TokenInfo({
      decimals: MEME_TOKEN_DECIMALS,
      mint: mint,
      name: "MEME",
      programId: new PublicKey(MEMECHAN_PROGRAM_ID_V2),
      symbol: "MEME",
      targetConfig: NATIVE_MINT,
      targetConfigV2: NATIVE_MINT,
    });
  }
  return result;
}
