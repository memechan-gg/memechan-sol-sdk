import { PublicKey } from "@solana/web3.js";
import { TokenInfo, TokenSymbol } from "./types";
import { getConfig } from "./config";
import { MEMECHAN_MEME_TOKEN_DECIMALS, TOKEN_PROGRAM_ID } from "./consts";

export async function getTokenInfoBySymbol(symbol: TokenSymbol): Promise<TokenInfo> {
  const config = await getConfig();
  return config.TOKEN_INFOS[symbol];
}

export async function getTokenInfoByMint(mint: PublicKey): Promise<TokenInfo> {
  const config = await getConfig();
  const result = Object.values(config.TOKEN_INFOS).find((tokenInfo) => tokenInfo.mint.equals(mint));
  if (!result) {
    return new TokenInfo({
      decimals: MEMECHAN_MEME_TOKEN_DECIMALS,
      mint: mint,
      name: "MEME",
      programId: TOKEN_PROGRAM_ID,
      symbol: "MEME",
      memeChanProgramId: config.MEMECHAN_PROGRAM_ID_PK,
      memeChanProgramIdV2: config.MEMECHAN_PROGRAM_ID_V2_PK,
    });
  }
  return result;
}
