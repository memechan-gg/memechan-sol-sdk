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

  
    const inputToken = MEMECHAN_QUOTE_TOKEN;
    const outputToken = new Token(TOKEN_PROGRAM_ID, new PublicKey("B1H5ih6EtfSUzbuQTCs4rvMLS74iDZ6a6aYatyiN1d56"), MEMECHAN_MEME_TOKEN_DECIMALS)
    const targetPool = "3cNwpm7ifYyeTeciEwoCyB1SQFX11JyN84chdQFT8tJv";
    const inputTokenAmount = new TokenAmount(inputToken, 10000)
    const slippage = new Percent(5, 100)
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

   // stakingPool.unstake(tickets);

  }, 550000);
});