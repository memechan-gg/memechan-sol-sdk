import {
  ApiPoolInfoV4,
  LIQUIDITY_STATE_LAYOUT_V4,
  Liquidity,
  MARKET_STATE_LAYOUT_V3,
  Market,
  SPL_MINT_LAYOUT,
} from "@raydium-io/raydium-sdk";
import { Connection, PublicKey } from "@solana/web3.js";

export async function formatAmmKeysById(id: string, connection: Connection): Promise<ApiPoolInfoV4> {
  const account = await connection.getAccountInfo(new PublicKey(id), { commitment: "confirmed" });
  if (account === null) throw Error(" get id info error ");
  const info = LIQUIDITY_STATE_LAYOUT_V4.decode(account.data);

  const accounts = await connection.getMultipleAccountsInfo(
    [new PublicKey(info.marketId), new PublicKey(info.lpMint)],
    "confirmed",
  );

  if (accounts === null) throw Error("get market and lp mint accounts error ");

  // Destructure the accounts array
  const [marketAccount, lpMintAccount] = accounts;

  if (marketAccount == null) throw Error("get market account error ");
  if (lpMintAccount == null) throw Error("get lp mint account error ");

  // Decode the account data using your custom layouts
  const marketInfo = MARKET_STATE_LAYOUT_V3.decode(marketAccount.data);
  const lpMintInfo = SPL_MINT_LAYOUT.decode(lpMintAccount.data);

  return {
    id,
    baseMint: info.baseMint.toString(),
    quoteMint: info.quoteMint.toString(),
    lpMint: info.lpMint.toString(),
    baseDecimals: info.baseDecimal.toNumber(),
    quoteDecimals: info.quoteDecimal.toNumber(),
    lpDecimals: lpMintInfo.decimals,
    version: 4,
    programId: account.owner.toString(),
    authority: Liquidity.getAssociatedAuthority({ programId: account.owner }).publicKey.toString(),
    openOrders: info.openOrders.toString(),
    targetOrders: info.targetOrders.toString(),
    baseVault: info.baseVault.toString(),
    quoteVault: info.quoteVault.toString(),
    withdrawQueue: info.withdrawQueue.toString(),
    lpVault: info.lpVault.toString(),
    marketVersion: 3,
    marketProgramId: info.marketProgramId.toString(),
    marketId: info.marketId.toString(),
    marketAuthority: Market.getAssociatedAuthority({
      programId: info.marketProgramId,
      marketId: info.marketId,
    }).publicKey.toString(),
    marketBaseVault: marketInfo.baseVault.toString(),
    marketQuoteVault: marketInfo.quoteVault.toString(),
    marketBids: marketInfo.bids.toString(),
    marketAsks: marketInfo.asks.toString(),
    marketEventQueue: marketInfo.eventQueue.toString(),
    lookupTableAccount: PublicKey.default.toString(),
  };
}
