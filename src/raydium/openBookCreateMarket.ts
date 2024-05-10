import {
  MarketV2,
  Token,
} from '@raydium-io/raydium-sdk';
import { Connection, Keypair } from '@solana/web3.js';
import { PROGRAMIDS, makeTxVersion } from './config';
import { buildAndSendTx } from '../utils/util';

type TestTxInputInfo = {
  baseToken: Token
  quoteToken: Token
  wallet: Keypair
  connection: Connection
}

export async function createMarket(input: TestTxInputInfo) {
  const createMarketInstruments = await MarketV2.makeCreateMarketInstructionSimple({
    connection: input.connection,
    wallet: input.wallet.publicKey,
    baseInfo: input.baseToken,
    quoteInfo: input.quoteToken,
    lotSize: 1,
    tickSize: 0.000001,
    dexProgramId: PROGRAMIDS.OPENBOOK_MARKET,
    makeTxVersion,
  })

  return { txids: await buildAndSendTx(input.connection, input.wallet, createMarketInstruments.innerTransactions, { skipPreflight: true } ), marketId: createMarketInstruments.address.marketId }
}
