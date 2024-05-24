import BN from "bn.js";
import { BoundPoolClient } from "../src/bound-pool/BoundPool";
import { sleep } from "../src/common/helpers";
import { MEMECHAN_MEME_TOKEN_DECIMALS, MEMECHAN_QUOTE_TOKEN } from "../src/config/config";
import { StakingPool } from "../src/staking-pool/StakingPool";
import { DUMMY_TOKEN_METADATA, admin, client, payer} from "./common/common";
import { FEE_DESTINATION_ID } from "./common/env";
import { MemeTicket } from "../src/memeticket/MemeTicket";
import { swapOnlyAmm } from "../src/raydium/swapOnlyAmm";
import { Percent, TokenAmount, Token } from "@raydium-io/raydium-sdk";
import { TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { PublicKey, Transaction } from "@solana/web3.js";
import { getWalletTokenAccount } from "../src/util";

describe("StakingPool", () => {
  it.skip("all", async () => {
    /*const all = await StakingPool.all(client.memechanProgram);

    for (const pool of all) {
      //console.log(JSON.stringify(pool.account));
      //console.log("==================================================");
    }*/
  }, 30000);

  it.skip("swapy, golive, ammSwap, unstake", async () => {
   const boundPool = await BoundPoolClient.new({
      admin,
      payer,
      signer: payer,
      client,
      quoteToken: MEMECHAN_QUOTE_TOKEN,
      tokenMetadata: DUMMY_TOKEN_METADATA,
    });

    console.log("==== pool id: " + boundPool.id.toString());
    await sleep(2000);
    
    const tickets: MemeTicket[] = [];

    const ticketId = await boundPool.swapY({
      payer: payer,
      user: payer,
      memeTokensOut: new BN(100*1e6),
      quoteAmountIn: new BN(5000*1e9),
      quoteMint: MEMECHAN_QUOTE_TOKEN.mint,
      pool: boundPool.id,
    });

    console.log("swapY ticketId: " + ticketId.id.toBase58());

    const ticket1 = new MemeTicket(ticketId.id, client);
    tickets.push(ticket1);

    const ticket1Data = await ticket1.fetch();
    console.log("ticket1Data: amount: %s, notional: %s, released: %s ", ticket1Data.amount.toString(), ticket1Data.vesting.notional.toString(), ticket1Data.vesting.released.toString());

    const ticketId2 = await boundPool.swapY({
      payer: payer,
      user: payer,
      memeTokensOut: new BN(4000*1e6),
      quoteAmountIn: new BN(40000*1e9),
      quoteMint: MEMECHAN_QUOTE_TOKEN.mint,
      pool: boundPool.id,
    });

    tickets.push(new MemeTicket(ticketId2.id, client));
    console.log("swapY ticketId2: " + ticketId2.id.toBase58());

    const boundPoolInfo = await BoundPoolClient.fetch2(client.connection, boundPool.id);

    console.log("boundPoolInfo:", boundPoolInfo);

    const { stakingMemeVault, stakingQuoteVault } = await boundPool.initStakingPool({
      payer: payer,
      user: payer,
      boundPoolInfo,
    });

    const [stakingPool, ammPool ] = await boundPool.goLive({
      payer: payer,
      user: payer,
      boundPoolInfo,
      feeDestinationWalletAddress: FEE_DESTINATION_ID,
      memeVault: stakingMemeVault,
      quoteVault: stakingQuoteVault,
    });
    console.log("ammPool: " + JSON.stringify(ammPool));

    const inputToken = MEMECHAN_QUOTE_TOKEN;
    const outputToken = new Token(TOKEN_PROGRAM_ID, ammPool.baseMint, MEMECHAN_MEME_TOKEN_DECIMALS)
    const inputTokenAmount = new TokenAmount(inputToken, 1000*1e9)
    const slippage = new Percent(5, 100)
    const walletTokenAccounts = await getWalletTokenAccount(client.connection, payer.publicKey)

    const swapTxIds = await swapOnlyAmm({
      connection: client.connection,
      outputToken,
      targetPool: ammPool.id,
      inputTokenAmount,
      slippage,
      walletTokenAccounts,
      wallet: payer,
    });

    console.log('amm swapresult txids: ', swapTxIds)

    await sleep(180000); // sleep 3 min cliff

    StakingPool.fromStakingPoolId({ client, poolAccountAddressId: stakingPool.id});

    const unstakeResult = await stakingPool.unstake({
      amount: new BN(10*1e6),
      user: payer,
      ticket: tickets[0],
    });

    console.log("unstakeResult: ", unstakeResult);

    const ticketDataUpdated = await ticket1.fetch();
    console.log("ticketDataUpdated: amount: %s, notional: %s, released: %s ", ticketDataUpdated.amount.toString(), ticketDataUpdated.vesting.notional.toString(), ticketDataUpdated.vesting.released.toString());

  }, 850000);

  it("swapy, golive, ammSwap, addFees, withdrawfees", async () => {
    const boundPool = await BoundPoolClient.new({
      admin,
      payer,
      signer: payer,
      client,
      quoteToken: MEMECHAN_QUOTE_TOKEN,
      tokenMetadata: DUMMY_TOKEN_METADATA,
    });

    console.log("==== pool id: " + boundPool.id.toString());
    await sleep(2000);
    
    const tickets: MemeTicket[] = [];

    const ticketId = await boundPool.swapY({
      payer: payer,
      user: payer,
      memeTokensOut: new BN(100*1e6),
      quoteAmountIn: new BN(5000*1e9),
      quoteMint: MEMECHAN_QUOTE_TOKEN.mint,
      pool: boundPool.id,
    });

    tickets.push(new MemeTicket(ticketId.id, client));
    console.log("swapY ticketId: " + ticketId.id.toBase58());

    const ticketId2 = await boundPool.swapY({
      payer: payer,
      user: payer,
      memeTokensOut: new BN(100*1e6),
      quoteAmountIn: new BN(40000*1e9),
      quoteMint: MEMECHAN_QUOTE_TOKEN.mint,
      pool: boundPool.id,
    });

    tickets.push(new MemeTicket(ticketId2.id, client));
    console.log("swapY ticketId2: " + ticketId2.id.toBase58());

    const boundPoolInfo = await BoundPoolClient.fetch2(client.connection, boundPool.id);

    console.log("boundPoolInfo:", boundPoolInfo);

    const { stakingMemeVault, stakingQuoteVault } = await boundPool.initStakingPool({
      payer: payer,
      user: payer,
      boundPoolInfo,
    });

    const [stakingPool, ammPool ] = await boundPool.goLive({
      payer: payer,
      user: payer,
      boundPoolInfo,
      feeDestinationWalletAddress: FEE_DESTINATION_ID,
      memeVault: stakingMemeVault,
      quoteVault: stakingQuoteVault,
    });
    console.log("ammPool: " + JSON.stringify(ammPool));

    const inputToken = MEMECHAN_QUOTE_TOKEN;
    const outputToken = new Token(TOKEN_PROGRAM_ID, ammPool.baseMint, MEMECHAN_MEME_TOKEN_DECIMALS)
    const inputTokenAmount = new TokenAmount(inputToken, 1000*1e9)
    const slippage = new Percent(5, 100)
    const walletTokenAccounts = await getWalletTokenAccount(client.connection, payer.publicKey)

    const swapTxIds = await swapOnlyAmm({
      connection: client.connection,
      outputToken,
      targetPool: ammPool.id,
      inputTokenAmount,
      slippage,
      walletTokenAccounts,
      wallet: payer,
    });

    console.log('amm swapresult txids: ', swapTxIds)

    await stakingPool.addFees({payer, transaction: new Transaction(), ammPoolId: new PublicKey(ammPool.id)});

    StakingPool.fromStakingPoolId({ client, poolAccountAddressId: stakingPool.id});

    const withdrawResult = await stakingPool.withdrawFees({
      user: payer,
      ticket: tickets[0],
    });

    console.log("withrdawResult: ", withdrawResult);

  }, 550000);

  it.skip("swapy, golive, ammSwap, addFees", async () => {
    const boundPool = await BoundPoolClient.new({
      admin,
      payer,
      signer: payer,
      client,
      quoteToken: MEMECHAN_QUOTE_TOKEN,
      tokenMetadata: DUMMY_TOKEN_METADATA,
    });

    console.log("==== pool id: " + boundPool.id.toString());
    await sleep(2000);
    const tickets: MemeTicket[] = [];

    const ticketId = await boundPool.swapY({
      payer: payer,
      user: payer,
      memeTokensOut: new BN(100*1e6),
      quoteAmountIn: new BN(5000*1e9),
      quoteMint: MEMECHAN_QUOTE_TOKEN.mint,
      pool: boundPool.id,
    });

    tickets.push(new MemeTicket(ticketId.id, client));
    console.log("swapY ticketId: " + ticketId.id.toBase58());

    const ticketId2 = await boundPool.swapY({
      payer: payer,
      user: payer,
      memeTokensOut: new BN(4000*1e6),
      quoteAmountIn: new BN(40000*1e9),
      quoteMint: MEMECHAN_QUOTE_TOKEN.mint,
      pool: boundPool.id,
    });

    tickets.push(new MemeTicket(ticketId2.id, client));
    console.log("swapY ticketId2: " + ticketId2.id.toBase58());

    const boundPoolInfo = await BoundPoolClient.fetch2(client.connection, boundPool.id);

    console.log("boundPoolInfo:", boundPoolInfo);

    const { stakingMemeVault, stakingQuoteVault } = await boundPool.initStakingPool({
      payer: payer,
      user: payer,
      boundPoolInfo,
    });

    const [stakingPool, ammPool ] = await boundPool.goLive({
      payer: payer,
      user: payer,
      boundPoolInfo,
      feeDestinationWalletAddress: FEE_DESTINATION_ID,
      memeVault: stakingMemeVault,
      quoteVault: stakingQuoteVault,
    });
    console.log("ammPool: " + JSON.stringify(ammPool));

    const inputToken = MEMECHAN_QUOTE_TOKEN;
    const outputToken = new Token(TOKEN_PROGRAM_ID, ammPool.baseMint, MEMECHAN_MEME_TOKEN_DECIMALS)
    const inputTokenAmount = new TokenAmount(inputToken, 10000)
    const slippage = new Percent(5, 100)
    const walletTokenAccounts = await getWalletTokenAccount(client.connection, payer.publicKey)

    const swapTxIds = await swapOnlyAmm({
      connection: client.connection,
      outputToken,
      targetPool: ammPool.id,
      inputTokenAmount,
      slippage,
      walletTokenAccounts,
      wallet: payer,
    });

    console.log('amm swapresult txids: ', swapTxIds)

    StakingPool.fromStakingPoolId({ client, poolAccountAddressId: stakingPool.id});

    await stakingPool.addFees({payer, transaction: new Transaction(), ammPoolId: new PublicKey(ammPool.id)});

    console.log("addFeesResult completed" );

  }, 550000);
});