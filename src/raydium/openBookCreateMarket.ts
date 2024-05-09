import {
  MarketV2,
  Token,
  DEVNET_PROGRAM_ID,
} from '@raydium-io/raydium-sdk';
import { Connection, Keypair, PublicKey } from '@solana/web3.js';
import { makeTxVersion } from './config';
import { buildAndSendTx } from '../utils/util';
import { TOKEN_PROGRAM_ID } from '@solana/spl-token';


type TestTxInputInfo = {
  baseToken: Token
  quoteToken: Token
  wallet: Keypair
  connection: Connection
}

export async function createMarketTest(input: TestTxInputInfo) {
  // -------- step 1: make instructions --------

  const USDC = new Token(TOKEN_PROGRAM_ID, new PublicKey('EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v'), 6, 'USDC', 'USDC');
  const RAY = new Token(TOKEN_PROGRAM_ID, new PublicKey('4k3Dyjzvzp8eMZWUXbBCjEvwSkkk59S5iCNLY3QrkX6R'), 6, 'RAY', 'RAY');

  const createMarketInstruments = await MarketV2.makeCreateMarketInstructionSimple({
    connection: input.connection,
    wallet: input.wallet.publicKey,
    baseInfo: RAY,
    quoteInfo: USDC,
    lotSize: 1, // default 1
    tickSize: 0.000001, // default 0.01
    dexProgramId: DEVNET_PROGRAM_ID.OPENBOOK_MARKET,
    makeTxVersion,
  })

  return { txids: await buildAndSendTx(input.connection, input.wallet, createMarketInstruments.innerTransactions), marketId: createMarketInstruments.address.marketId }
}

export async function createMarket(input: TestTxInputInfo) {
  // -------- step 1: make instructions --------
  const createMarketInstruments = await MarketV2.makeCreateMarketInstructionSimple({
    connection: input.connection,
    wallet: input.wallet.publicKey,
    baseInfo: input.baseToken,
    quoteInfo: input.quoteToken,
    lotSize: 1, // default 1
    tickSize: 0.000001, // default 0.01
    dexProgramId: DEVNET_PROGRAM_ID.OPENBOOK_MARKET,
    makeTxVersion,
  })

  return { txids: await buildAndSendTx(input.connection, input.wallet, createMarketInstruments.innerTransactions), marketId: createMarketInstruments.address.marketId }
}

// async function howToUse() {
//   const baseToken = DEFAULT_TOKEN.RAY // RAY
//   const quoteToken = DEFAULT_TOKEN.USDC // USDC

//   createMarket({
//     baseToken,
//     quoteToken,
//     wallet: wallet,
//   }).then(({ txids }) => {
//     /** continue with txids */
//     console.log('txids', txids)
//   })
// }