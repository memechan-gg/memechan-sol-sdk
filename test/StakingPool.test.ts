import { MEMECHAN_QUOTE_TOKEN } from "../src/config/config";
import { StakingPool } from "../src/staking-pool/StakingPool";
import { STAKING_POOL_ID, client, payer} from "./common/common";
import { swapOnlyAmm } from "../src/raydium/swapOnlyAmm";
import { Percent, TokenAmount, Token } from "@raydium-io/raydium-sdk";
import { TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { PublicKey } from "@solana/web3.js";
import { getWalletTokenAccount } from "../src/util";

describe("StakingPool", () => {
  it.skip("all", async () => {
    const all = await StakingPool.all(client.memechanProgram);

    for (const pool of all) {
      //console.log(JSON.stringify(pool.account));
      //console.log("==================================================");
    }
  }, 30000);

  it("swap, unstake", async () => {
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

    // const boundPoolInfo = await BoundPoolClient.fetch2(client.connection, pool.id);

    // console.log("boundPoolInfo:", boundPoolInfo);

    // const { stakingMemeVault, stakingQuoteVault } = await pool.slowInitStakingPool({
    //   payer: payer,
    //   user: payer,
    //   boundPoolInfo,
    // });

    // console.log("stakingMemeVault: " + stakingMemeVault.toString());
    // console.log("stakingQuoteVault: " + stakingQuoteVault.toString());

    // await sleep(2000);

    // const [stakingPool ] = await pool.goLive({
    //   payer: payer,
    //   user: payer,
    //   boundPoolInfo,
    //   feeDestinationWalletAddress: FEE_DESTINATION_ID,
    //   memeVault: stakingMemeVault,
    //   quoteVault: stakingQuoteVault,
    // });

    // console.log("golive finished. stakingPool: " + stakingPool.id.toString());
    
    const stakingPool = await StakingPool.fromStakingPoolId({client, poolAccountAddressId: STAKING_POOL_ID});

    const inputToken = MEMECHAN_QUOTE_TOKEN;
    const outputToken = new Token(TOKEN_PROGRAM_ID, new PublicKey("HJ4wgN3N98adPGcSQfwCFZHcUDJoAb7aYi7fksh1ewqB"), 6)
    const targetPool = STAKING_POOL_ID.toBase58();
    const inputTokenAmount = new TokenAmount(inputToken, 1)
    const slippage = new Percent(10, 100)
    const walletTokenAccounts = await getWalletTokenAccount(client.connection, payer.publicKey)

    await swapOnlyAmm({
      connection: client.connection,
      outputToken,
      targetPool,
      inputTokenAmount,
      slippage,
      walletTokenAccounts,
      wallet: payer,
    }).then(({ txids }) => {
      /** continue with txids */
      console.log('amm swapresult txids', txids)
    })

    //stakingPool.unstake(tickets);

  }, 550000);
});