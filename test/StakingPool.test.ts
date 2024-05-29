import BN from "bn.js";
import { BoundPoolClient } from "../src/bound-pool/BoundPoolClient";
import { sleep } from "../src/common/helpers";
import { FEE_DESTINATION_ID, MEMECHAN_MEME_TOKEN_DECIMALS, MEMECHAN_QUOTE_TOKEN } from "../src/config/config";
import { StakingPoolClient } from "../src/staking-pool/StakingPoolClient";
import { DUMMY_TOKEN_METADATA, admin, client, payer } from "./common/common";
import { MemeTicketClient } from "../src/memeticket/MemeTicketClient";
import { swapOnlyAmm } from "../src/raydium/swapOnlyAmm";
import { Percent, TokenAmount, Token } from "@raydium-io/raydium-sdk";
import { TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { PublicKey } from "@solana/web3.js";
import { getWalletTokenAccount } from "../src/util";

describe.skip("StakingPoolClient", () => {
  it.skip("all", async () => {
    /* const all = await StakingPoolClient.all(client.memechanProgram);

    for (const pool of all) {
      //console.log(JSON.stringify(pool.account));
      //console.log("==================================================");
    }*/
  }, 30000);

  it.skip("swapy, golive, ammSwap, unstake", async () => {
    const boundPool = await BoundPoolClient.new({
      admin,
      payer,
      client,
      quoteToken: MEMECHAN_QUOTE_TOKEN,
      tokenMetadata: DUMMY_TOKEN_METADATA,
    });

    console.log("==== pool id: " + boundPool.id.toString());
    const tickets: MemeTicketClient[] = [];

    const ticketId = await boundPool.swapY({
      payer: payer,
      user: payer,
      memeTokensOut: new BN(100 * 1e6),
      quoteAmountIn: new BN(5000 * 1e9),
      quoteMint: MEMECHAN_QUOTE_TOKEN.mint,
      pool: boundPool.id,
    });

    console.log("swapY ticketId: " + ticketId.id.toBase58());

    const ticket1 = new MemeTicketClient(ticketId.id, client);
    tickets.push(ticket1);

    const ticket1Data = await ticket1.fetch();
    console.log(
      "ticket1Data: amount: %s, notional: %s, released: %s ",
      ticket1Data.amount.toString(),
      ticket1Data.vesting.notional.toString(),
      ticket1Data.vesting.released.toString(),
    );

    const ticketId2 = await boundPool.swapY({
      payer: payer,
      user: payer,
      memeTokensOut: new BN(4000 * 1e6),
      quoteAmountIn: new BN(40000 * 1e9),
      quoteMint: MEMECHAN_QUOTE_TOKEN.mint,
      pool: boundPool.id,
    });

    tickets.push(new MemeTicketClient(ticketId2.id, client));
    console.log("swapY ticketId2: " + ticketId2.id.toBase58());

    const boundPoolInfo = await BoundPoolClient.fetch2(client.connection, boundPool.id);

    console.log("boundPoolInfo:", boundPoolInfo);

    const { stakingMemeVault, stakingQuoteVault } = await boundPool.initStakingPool({
      payer: payer,
      user: payer,
      boundPoolInfo,
    });

    const [stakingPool, livePool] = await boundPool.goLive({
      payer: payer,
      user: payer,
      boundPoolInfo,
      feeDestinationWalletAddress: FEE_DESTINATION_ID,
      memeVault: stakingMemeVault,
      quoteVault: stakingQuoteVault,
    });

    const ammPool = livePool.ammPoolInfo;
    console.log("ammPool: " + JSON.stringify(ammPool));

    const inputToken = MEMECHAN_QUOTE_TOKEN;
    const outputToken = new Token(TOKEN_PROGRAM_ID, ammPool.baseMint, MEMECHAN_MEME_TOKEN_DECIMALS);
    const inputTokenAmount = new TokenAmount(inputToken, 1000 * 1e9);
    const slippage = new Percent(5, 100);
    const walletTokenAccounts = await getWalletTokenAccount(client.connection, payer.publicKey);

    const swapTxIds = await swapOnlyAmm({
      connection: client.connection,
      outputToken,
      targetPool: ammPool.id,
      inputTokenAmount,
      slippage,
      walletTokenAccounts,
      wallet: payer,
    });

    console.log("amm swapresult txids: ", swapTxIds);

    await sleep(180000); // sleep 3 min cliff

    const unstakeResult = await stakingPool.unstake({
      amount: new BN(10 * 1e6),
      user: payer,
      ticket: tickets[0],
    });

    console.log("unstakeResult: ", unstakeResult);

    const ticketDataUpdated = await ticket1.fetch();
    console.log(
      "ticketDataUpdated: amount: %s, notional: %s, released: %s ",
      ticketDataUpdated.amount.toString(),
      ticketDataUpdated.vesting.notional.toString(),
      ticketDataUpdated.vesting.released.toString(),
    );
  }, 850000);

  it.skip("swapy, golive, CantUnstakeBeforeCliff", async () => {
    const boundPool = await BoundPoolClient.new({
      admin,
      payer,
      client,
      quoteToken: MEMECHAN_QUOTE_TOKEN,
      tokenMetadata: DUMMY_TOKEN_METADATA,
    });

    console.log("==== pool id: " + boundPool.id.toString());

    const tickets: MemeTicketClient[] = [];

    const ticketId = await boundPool.swapY({
      payer: payer,
      user: payer,
      memeTokensOut: new BN(1000 * 1e6),
      quoteAmountIn: new BN(500000 * 1e9),
      quoteMint: MEMECHAN_QUOTE_TOKEN.mint,
      pool: boundPool.id,
    });

    console.log("swapY ticketId: " + ticketId.id.toBase58());

    const boundPoolInfo = await BoundPoolClient.fetch2(client.connection, boundPool.id);

    console.log("boundPoolInfo:", boundPoolInfo);

    const { stakingMemeVault, stakingQuoteVault } = await boundPool.initStakingPool({
      payer: payer,
      user: payer,
      boundPoolInfo,
    });

    const [stakingPool, livePool] = await boundPool.goLive({
      payer: payer,
      user: payer,
      boundPoolInfo,
      feeDestinationWalletAddress: FEE_DESTINATION_ID,
      memeVault: stakingMemeVault,
      quoteVault: stakingQuoteVault,
    });

    const ammPool = livePool.ammPoolInfo;
    console.log("ammPool: " + JSON.stringify(ammPool));

    await stakingPool.addFees({ payer, ammPoolId: new PublicKey(ammPool.id) });

    await expect(
      stakingPool.unstake({
        amount: new BN(10 * 1e6),
        user: payer,
        ticket: tickets[0],
      }),
    ).rejects.toThrow();
  }, 850000);

  it.skip("swapy, golive, ammswap, multiple addfees, multiple unstakes without addfees between", async () => {
    const boundPool = await BoundPoolClient.new({
      admin,
      payer,
      client,
      quoteToken: MEMECHAN_QUOTE_TOKEN,
      tokenMetadata: DUMMY_TOKEN_METADATA,
    });

    console.log("==== pool id: " + boundPool.id.toString());

    const tickets: MemeTicketClient[] = [];

    const ticketId = await boundPool.swapY({
      payer: payer,
      user: payer,
      memeTokensOut: new BN(3000 * 1e6),
      quoteAmountIn: new BN(550000 * 1e9),
      quoteMint: MEMECHAN_QUOTE_TOKEN.mint,
      pool: boundPool.id,
    });

    console.log("swapY ticketId: " + ticketId.id.toBase58());

    const ticket1 = new MemeTicketClient(ticketId.id, client);
    tickets.push(ticket1);

    const boundPoolInfo = await BoundPoolClient.fetch2(client.connection, boundPool.id);

    console.log("boundPoolInfo:", boundPoolInfo);

    const { stakingMemeVault, stakingQuoteVault } = await boundPool.initStakingPool({
      payer: payer,
      user: payer,
      boundPoolInfo,
    });

    const [stakingPool, livePool] = await boundPool.goLive({
      payer: payer,
      user: payer,
      boundPoolInfo,
      feeDestinationWalletAddress: FEE_DESTINATION_ID,
      memeVault: stakingMemeVault,
      quoteVault: stakingQuoteVault,
    });

    const ammPool = livePool.ammPoolInfo;
    console.log("ammPool: " + JSON.stringify(ammPool));

    const inputToken = MEMECHAN_QUOTE_TOKEN;
    const outputToken = new Token(TOKEN_PROGRAM_ID, ammPool.baseMint, MEMECHAN_MEME_TOKEN_DECIMALS);
    const inputTokenAmount = new TokenAmount(inputToken, 1000 * 1e9);
    const slippage = new Percent(5, 100);
    const walletTokenAccounts = await getWalletTokenAccount(client.connection, payer.publicKey);

    const swapTxIds = await swapOnlyAmm({
      connection: client.connection,
      outputToken,
      targetPool: ammPool.id,
      inputTokenAmount,
      slippage,
      walletTokenAccounts,
      wallet: payer,
    });

    console.log("amm swapresult txids: ", swapTxIds);

    await sleep(180000); // sleep 3 min cliff

    await stakingPool.addFees({ payer, ammPoolId: new PublicKey(ammPool.id) });

    const unstakeResult0 = await stakingPool.unstake({
      amount: new BN(10 * 1e6),
      user: payer,
      ticket: tickets[0],
    });

    console.log("unstakeResult0: ", unstakeResult0);

    const unstakeResult1 = await stakingPool.unstake({
      amount: new BN(20 * 1e6),
      user: payer,
      ticket: tickets[0],
    });

    console.log("unstakeResult1: ", unstakeResult1);
  }, 950000);

  it.skip("swapy, golive, ammswap, multiple addfees, multiple unstakes with addfees between", async () => {
    const boundPool = await BoundPoolClient.new({
      admin,
      payer,
      client,
      quoteToken: MEMECHAN_QUOTE_TOKEN,
      tokenMetadata: DUMMY_TOKEN_METADATA,
    });

    console.log("==== pool id: " + boundPool.id.toString());

    const tickets: MemeTicketClient[] = [];

    const ticketId = await boundPool.swapY({
      payer: payer,
      user: payer,
      memeTokensOut: new BN(3000 * 1e6),
      quoteAmountIn: new BN(550000 * 1e9),
      quoteMint: MEMECHAN_QUOTE_TOKEN.mint,
      pool: boundPool.id,
    });

    console.log("swapY ticketId: " + ticketId.id.toBase58());

    const ticket1 = new MemeTicketClient(ticketId.id, client);
    tickets.push(ticket1);

    const boundPoolInfo = await BoundPoolClient.fetch2(client.connection, boundPool.id);

    console.log("boundPoolInfo:", boundPoolInfo);

    const { stakingMemeVault, stakingQuoteVault } = await boundPool.initStakingPool({
      payer: payer,
      user: payer,
      boundPoolInfo,
    });

    const [stakingPool, livePool] = await boundPool.goLive({
      payer: payer,
      user: payer,
      boundPoolInfo,
      feeDestinationWalletAddress: FEE_DESTINATION_ID,
      memeVault: stakingMemeVault,
      quoteVault: stakingQuoteVault,
    });

    const ammPool = livePool.ammPoolInfo;
    console.log("ammPool: " + JSON.stringify(ammPool));

    const inputToken = MEMECHAN_QUOTE_TOKEN;
    const outputToken = new Token(TOKEN_PROGRAM_ID, ammPool.baseMint, MEMECHAN_MEME_TOKEN_DECIMALS);
    const inputTokenAmount = new TokenAmount(inputToken, 1000 * 1e9);
    const slippage = new Percent(5, 100);
    const walletTokenAccounts = await getWalletTokenAccount(client.connection, payer.publicKey);

    const swapTxIds = await swapOnlyAmm({
      connection: client.connection,
      outputToken,
      targetPool: ammPool.id,
      inputTokenAmount,
      slippage,
      walletTokenAccounts,
      wallet: payer,
    });

    console.log("amm swapresult txids: ", swapTxIds);

    await sleep(180000); // sleep 3 min cliff

    await stakingPool.addFees({ payer, ammPoolId: new PublicKey(ammPool.id) });
    await stakingPool.addFees({ payer, ammPoolId: new PublicKey(ammPool.id) });

    const unstakeResult0 = await stakingPool.unstake({
      amount: new BN(10 * 1e6),
      user: payer,
      ticket: tickets[0],
    });

    console.log("unstakeResult0: ", unstakeResult0);

    await stakingPool.addFees({ payer, ammPoolId: new PublicKey(ammPool.id) });

    const unstakeResult1 = await stakingPool.unstake({
      amount: new BN(20 * 1e6),
      user: payer,
      ticket: tickets[0],
    });

    console.log("unstakeResult1: ", unstakeResult1);
  }, 950000);

  it.skip("swapy, golive, multiple ammSwaps, multiple addfees, multiple unstakes", async () => {
    const boundPool = await BoundPoolClient.new({
      admin,
      payer,
      client,
      quoteToken: MEMECHAN_QUOTE_TOKEN,
      tokenMetadata: DUMMY_TOKEN_METADATA,
    });

    console.log("==== pool id: " + boundPool.id.toString());

    const tickets: MemeTicketClient[] = [];

    const ticketId = await boundPool.swapY({
      payer: payer,
      user: payer,
      memeTokensOut: new BN(100 * 1e6),
      quoteAmountIn: new BN(5000 * 1e9),
      quoteMint: MEMECHAN_QUOTE_TOKEN.mint,
      pool: boundPool.id,
    });

    console.log("swapY ticketId: " + ticketId.id.toBase58());

    const ticket1 = new MemeTicketClient(ticketId.id, client);
    tickets.push(ticket1);

    const ticket1Data = await ticket1.fetch();
    console.log(
      "ticket1Data: amount: %s, notional: %s, released: %s ",
      ticket1Data.amount.toString(),
      ticket1Data.vesting.notional.toString(),
      ticket1Data.vesting.released.toString(),
    );

    const ticketId2 = await boundPool.swapY({
      payer: payer,
      user: payer,
      memeTokensOut: new BN(4000 * 1e6),
      quoteAmountIn: new BN(5550000 * 1e9),
      quoteMint: MEMECHAN_QUOTE_TOKEN.mint,
      pool: boundPool.id,
    });

    tickets.push(new MemeTicketClient(ticketId2.id, client));
    console.log("swapY ticketId2: " + ticketId2.id.toBase58());

    const boundPoolInfo = await BoundPoolClient.fetch2(client.connection, boundPool.id);

    console.log("boundPoolInfo:", boundPoolInfo);

    const { stakingMemeVault, stakingQuoteVault } = await boundPool.initStakingPool({
      payer: payer,
      user: payer,
      boundPoolInfo,
    });

    const [stakingPool, livePool] = await boundPool.goLive({
      payer: payer,
      user: payer,
      boundPoolInfo,
      feeDestinationWalletAddress: FEE_DESTINATION_ID,
      memeVault: stakingMemeVault,
      quoteVault: stakingQuoteVault,
    });

    const ammPool = livePool.ammPoolInfo;
    console.log("ammPool: " + JSON.stringify(ammPool));

    const inputToken = MEMECHAN_QUOTE_TOKEN;
    const outputToken = new Token(TOKEN_PROGRAM_ID, ammPool.baseMint, MEMECHAN_MEME_TOKEN_DECIMALS);
    const inputTokenAmount = new TokenAmount(inputToken, 1000 * 1e9);
    const slippage = new Percent(5, 100);
    let walletTokenAccounts = await getWalletTokenAccount(client.connection, payer.publicKey);

    const swapTxIds = await swapOnlyAmm({
      connection: client.connection,
      outputToken,
      targetPool: ammPool.id,
      inputTokenAmount,
      slippage,
      walletTokenAccounts,
      wallet: payer,
    });

    console.log("amm swapresult 0 txids: %s, ", swapTxIds + " " + new Date().toUTCString());

    await sleep(180000); // sleep 3 min cliff

    await stakingPool.addFees({ payer, ammPoolId: new PublicKey(ammPool.id) });

    walletTokenAccounts = await getWalletTokenAccount(client.connection, payer.publicKey); // without this, swap fails
    const swapTxIds1 = await swapOnlyAmm({
      connection: client.connection,
      outputToken,
      targetPool: ammPool.id,
      inputTokenAmount: new TokenAmount(inputToken, 1000 * 1e9),
      slippage,
      walletTokenAccounts,
      wallet: payer,
    });

    console.log("amm swapresult 1 txids: ", swapTxIds1 + " " + new Date().toUTCString());

    await stakingPool.addFees({ payer, ammPoolId: new PublicKey(ammPool.id) });

    const unstakeResult0 = await stakingPool.unstake({
      amount: new BN(10 * 1e6),
      user: payer,
      ticket: tickets[0],
    });

    console.log("unstakeResult0: ", unstakeResult0);

    const ticketDataUpdated = await ticket1.fetch();
    console.log(
      "ticketDataUpdated: amount: %s, notional: %s, released: %s ",
      ticketDataUpdated.amount.toString(),
      ticketDataUpdated.vesting.notional.toString(),
      ticketDataUpdated.vesting.released.toString(),
    );

    const swapTxIds2 = await swapOnlyAmm({
      connection: client.connection,
      outputToken,
      targetPool: ammPool.id,
      inputTokenAmount: new TokenAmount(inputToken, 10000 * 1e9),
      slippage,
      walletTokenAccounts,
      wallet: payer,
    });

    console.log("amm swapresult 2 txids: ", swapTxIds2 + " " + new Date().toUTCString());

    await stakingPool.addFees({ payer, ammPoolId: new PublicKey(ammPool.id) });

    const unstakeResult1 = await stakingPool.unstake({
      amount: new BN(100 * 1e6),
      user: payer,
      ticket: tickets[0],
    });

    console.log("unstakeResult1: ", unstakeResult1);
  }, 850000);

  it.skip("swapy, golive, ammSwap, addFees, withdrawfees", async () => {
    const boundPool = await BoundPoolClient.new({
      admin,
      payer,
      client,
      quoteToken: MEMECHAN_QUOTE_TOKEN,
      tokenMetadata: DUMMY_TOKEN_METADATA,
    });

    console.log("==== pool id: " + boundPool.id.toString());

    const tickets: MemeTicketClient[] = [];

    const ticketId = await boundPool.swapY({
      payer: payer,
      user: payer,
      memeTokensOut: new BN(100 * 1e6),
      quoteAmountIn: new BN(5000 * 1e9),
      quoteMint: MEMECHAN_QUOTE_TOKEN.mint,
      pool: boundPool.id,
    });

    tickets.push(new MemeTicketClient(ticketId.id, client));
    console.log("swapY ticketId: " + ticketId.id.toBase58());

    const ticketId2 = await boundPool.swapY({
      payer: payer,
      user: payer,
      memeTokensOut: new BN(100 * 1e6),
      quoteAmountIn: new BN(40000 * 1e9),
      quoteMint: MEMECHAN_QUOTE_TOKEN.mint,
      pool: boundPool.id,
    });

    tickets.push(new MemeTicketClient(ticketId2.id, client));
    console.log("swapY ticketId2: " + ticketId2.id.toBase58());

    const boundPoolInfo = await BoundPoolClient.fetch2(client.connection, boundPool.id);

    console.log("boundPoolInfo:", boundPoolInfo);

    const { stakingMemeVault, stakingQuoteVault } = await boundPool.initStakingPool({
      payer: payer,
      user: payer,
      boundPoolInfo,
    });

    const [stakingPool, livePool] = await boundPool.goLive({
      payer: payer,
      user: payer,
      boundPoolInfo,
      feeDestinationWalletAddress: FEE_DESTINATION_ID,
      memeVault: stakingMemeVault,
      quoteVault: stakingQuoteVault,
    });

    const ammPool = livePool.ammPoolInfo;
    console.log("ammPool: " + JSON.stringify(ammPool));

    const inputToken = MEMECHAN_QUOTE_TOKEN;
    const outputToken = new Token(TOKEN_PROGRAM_ID, ammPool.baseMint, MEMECHAN_MEME_TOKEN_DECIMALS);
    const inputTokenAmount = new TokenAmount(inputToken, 1000 * 1e9);
    const slippage = new Percent(5, 100);
    const walletTokenAccounts = await getWalletTokenAccount(client.connection, payer.publicKey);

    const swapTxIds = await swapOnlyAmm({
      connection: client.connection,
      outputToken,
      targetPool: ammPool.id,
      inputTokenAmount,
      slippage,
      walletTokenAccounts,
      wallet: payer,
    });

    console.log("amm swapresult txids: ", swapTxIds);

    await stakingPool.addFees({ payer, ammPoolId: new PublicKey(ammPool.id) });

    StakingPoolClient.fromStakingPoolId({ client, poolAccountAddressId: stakingPool.id });

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
      client,
      quoteToken: MEMECHAN_QUOTE_TOKEN,
      tokenMetadata: DUMMY_TOKEN_METADATA,
    });

    console.log("==== pool id: " + boundPool.id.toString());
    const tickets: MemeTicketClient[] = [];

    const ticketId = await boundPool.swapY({
      payer: payer,
      user: payer,
      memeTokensOut: new BN(100 * 1e6),
      quoteAmountIn: new BN(5000 * 1e9),
      quoteMint: MEMECHAN_QUOTE_TOKEN.mint,
      pool: boundPool.id,
    });

    tickets.push(new MemeTicketClient(ticketId.id, client));
    console.log("swapY ticketId: " + ticketId.id.toBase58());

    const ticketId2 = await boundPool.swapY({
      payer: payer,
      user: payer,
      memeTokensOut: new BN(4000 * 1e6),
      quoteAmountIn: new BN(40000 * 1e9),
      quoteMint: MEMECHAN_QUOTE_TOKEN.mint,
      pool: boundPool.id,
    });

    tickets.push(new MemeTicketClient(ticketId2.id, client));
    console.log("swapY ticketId2: " + ticketId2.id.toBase58());

    const boundPoolInfo = await BoundPoolClient.fetch2(client.connection, boundPool.id);

    console.log("boundPoolInfo:", boundPoolInfo);

    const { stakingMemeVault, stakingQuoteVault } = await boundPool.initStakingPool({
      payer: payer,
      user: payer,
      boundPoolInfo,
    });

    const [stakingPool, livePool] = await boundPool.goLive({
      payer: payer,
      user: payer,
      boundPoolInfo,
      feeDestinationWalletAddress: FEE_DESTINATION_ID,
      memeVault: stakingMemeVault,
      quoteVault: stakingQuoteVault,
    });

    const ammPool = livePool.ammPoolInfo;
    console.log("ammPool: " + JSON.stringify(ammPool));

    const inputToken = MEMECHAN_QUOTE_TOKEN;
    const outputToken = new Token(TOKEN_PROGRAM_ID, ammPool.baseMint, MEMECHAN_MEME_TOKEN_DECIMALS);
    const inputTokenAmount = new TokenAmount(inputToken, 10000);
    const slippage = new Percent(5, 100);
    const walletTokenAccounts = await getWalletTokenAccount(client.connection, payer.publicKey);

    const swapTxIds = await swapOnlyAmm({
      connection: client.connection,
      outputToken,
      targetPool: ammPool.id,
      inputTokenAmount,
      slippage,
      walletTokenAccounts,
      wallet: payer,
    });

    console.log("amm swapresult txids: ", swapTxIds);

    StakingPoolClient.fromStakingPoolId({ client, poolAccountAddressId: stakingPool.id });

    await stakingPool.addFees({ payer, ammPoolId: new PublicKey(ammPool.id) });

    console.log("addFeesResult completed");
  }, 550000);
});
