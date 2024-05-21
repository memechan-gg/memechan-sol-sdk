import { MarketV2, Token } from "@raydium-io/raydium-sdk";
import { Connection, Keypair, PublicKey } from "@solana/web3.js";
import { PROGRAMIDS, addLookupTableInfo, makeTxVersion } from "./config";
import { buildAndSendTx } from "../util";

type CreateMarketTxInput = {
  baseToken: Token;
  quoteToken: Token;
  wallet: PublicKey;
  signer: Keypair;
  connection: Connection;
};

export async function createMarket(input: CreateMarketTxInput) {
  const createMarketInstruments = await MarketV2.makeCreateMarketInstructionSimple({
    connection: input.connection,
    wallet: input.wallet,
    baseInfo: input.baseToken,
    quoteInfo: input.quoteToken,
    lotSize: 1,
    tickSize: 0.000001,
    dexProgramId: PROGRAMIDS.OPENBOOK_MARKET,
    makeTxVersion,
  });

  return {
    txids: await buildAndSendTx(input.connection, input.signer, createMarketInstruments.innerTransactions, {
      skipPreflight: true,
    }),
    marketId: createMarketInstruments.address.marketId,
  };
}
