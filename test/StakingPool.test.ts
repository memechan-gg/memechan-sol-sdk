import BN from "bn.js";
import { BoundPoolClient } from "../src/bound-pool/BoundPool";
import { sleep } from "../src/common/helpers";
import { MEMECHAN_MEME_TOKEN_DECIMALS, MEMECHAN_QUOTE_TOKEN } from "../src/config/config";
import { StakingPool } from "../src/staking-pool/StakingPool";
import { DUMMY_TOKEN_METADATA, MARKET_ID, MEME_MINT, STAKING_POOL_ID, admin, client, payer} from "./common/common";
import { FEE_DESTINATION_ID } from "./common/env";
import { MemeTicket } from "../src/memeticket/MemeTicket";
import { swapOnlyAmm } from "../src/raydium/swapOnlyAmm";
import { Percent, TokenAmount, Token } from "@raydium-io/raydium-sdk";
import { getWalletTokenAccount } from "../src/utils/util";
import { TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { PublicKey } from "@solana/web3.js";

describe("StakingPool", () => {
  it.skip("all", async () => {
    const all = await StakingPool.all(client.memechanProgram);

    for (const pool of all) {
      //console.log(JSON.stringify(pool.account));
      //console.log("==================================================");
    }
  }, 30000);

  it.skip("swap, unstake", async () => {
    // //console.log("payer: " + payer.publicKey.toString());
    // // const pool = await BoundPoolClient.slowNew({
    // //   admin,
    // //   payer,
    // //   signer: payer,
    // //   client,
    // //   quoteToken: MEMECHAN_QUOTE_TOKEN,
    // //   tokenMetadata: DUMMY_TOKEN_METADATA,
    // // });

    // // console.log("==== pool id: " + pool.id.toString());
    // // await sleep(2000);

    // const pool = await BoundPoolClient.slowNew({
    //   admin,
    //   payer,
    //   signer: payer,
    //   client,
    //   quoteToken: MEMECHAN_QUOTE_TOKEN,
    //   tokenMetadata: DUMMY_TOKEN_METADATA,
    // });

    // console.log("==== pool id: " + pool.id.toString());
    // await sleep(2000);

    // const ticketId = await pool.swapY({
    //   payer: payer,
    //   user: payer,
    //   memeTokensOut: new BN(100),
    //   quoteAmountIn: new BN(100000),
    //   quoteMint: MEMECHAN_QUOTE_TOKEN.mint,
    //   pool: pool.id,
    // });

    // console.log("swapY ticketId: " + ticketId.id.toBase58());

    const stakingPool = await StakingPool.fromStakingPoolId({client, poolAccountAddressId: STAKING_POOL_ID});


    const inputToken = MEMECHAN_QUOTE_TOKEN;
    const outputToken = new Token(TOKEN_PROGRAM_ID, MEME_MINT, MEMECHAN_MEME_TOKEN_DECIMALS)
    const targetPool = STAKING_POOL_ID.toBase58();
    const inputTokenAmount = new TokenAmount(inputToken, 1)
    const slippage = new Percent(10, 100)
    const walletTokenAccounts = await getWalletTokenAccount(client.connection, payer.publicKey)

    // await swapOnlyAmm({
    //   connection: client.connection,
    //   outputToken,
    //   targetPool,
    //   inputTokenAmount,
    //   slippage,
    //   walletTokenAccounts,
    //   wallet: payer,
    //   lpMint: stakingPool.lpMint,
    //   baseVault: stakingPool.memeVault,
    //   quoteVault: stakingPool.quote_vault,
    //   //openOrders: stakingPool.openOrders,
    //   marketId: MARKET_ID,
    //  // marketEventQueue: stakingPool.marketEventQueue,

    // }).then(({ txids }) => {
    //   /** continue with txids */
    //   console.log('amm swapresult txids', txids)
    // })

   // stakingPool.unstake(tickets);

  }, 550000);
});