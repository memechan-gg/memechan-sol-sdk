import { PublicKey } from "@solana/web3.js";
import { MEMECHAN_MEME_TOKEN_DECIMALS, MEMECHAN_PROGRAM_ID_PK, MEMECHAN_PROGRAM_ID_V2_PK, TOKEN_INFOS } from "./config";
import { TokenInfo, TokenSymbol } from "./types";
import { TOKEN_PROGRAM_ID } from "./consts";

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
      programId: TOKEN_PROGRAM_ID,
      symbol: "MEME",
      memeChanProgramId: MEMECHAN_PROGRAM_ID_PK,
      memeChanProgramIdV2: MEMECHAN_PROGRAM_ID_V2_PK,
    });
  }
  return result;
}
