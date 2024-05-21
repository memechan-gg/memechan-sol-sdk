import { BN } from "@coral-xyz/anchor";
import { BoundPoolClient } from "../src/bound-pool/BoundPool";
import { sleep } from "../src/common/helpers";
import { DUMMY_TOKEN_METADATA, admin, client, payer } from "./common/common";
import { FEE_DESTINATION_ID } from "./common/env";
import { MEMECHAN_QUOTE_TOKEN } from "../src/config/config";

describe("BoundPool", () => {
  it.skip("creates bound pool", async () => {
    const boundPool = await BoundPoolClient.slowNew({
      admin,
      payer,
      signer: payer,
      client,
      quoteToken: MEMECHAN_QUOTE_TOKEN,
      tokenMetadata: DUMMY_TOKEN_METADATA,
    });
    await sleep(1000);
    const info = await BoundPoolClient.fetch2(client.connection, boundPool.id);
    console.log(info);
  }, 150000);

  it.skip("all", async () => {
    const all = await BoundPoolClient.all(client.memechanProgram);

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    for (const pool of all) {
      //console.log(pool.account);
      //console.log("==================================================");
    }

    console.log(all);
  }, 30000);

  it.skip("init staking pool then go live", async () => {
    console.log("payer: " + payer.publicKey.toString());
    const pool = await BoundPoolClient.slowNew({
      admin,
      payer,
      signer: payer,
      client,
      quoteToken: MEMECHAN_QUOTE_TOKEN,
      tokenMetadata: DUMMY_TOKEN_METADATA,
    });

    console.log("==== pool id: " + pool.id.toString());
    await sleep(2000);

    const ticketId = await pool.swapY({
      payer: payer,
      user: payer,
      memeTokensOut: new BN(10000),
      quoteAmountIn: new BN(10000000),
      quoteMint: MEMECHAN_QUOTE_TOKEN.mint,
      pool: pool.id,
    });

    console.log("swapY ticketId: " + ticketId.id.toBase58());

    const boundPoolInfo = await BoundPoolClient.fetch2(client.connection, pool.id);

    console.log("boundPoolInfo:", boundPoolInfo);

    const { stakingMemeVault, stakingQuoteVault } = await pool.slowInitStakingPool({
      payer: payer,
      user: payer,
      boundPoolInfo,
    });

    console.log("stakingMemeVault: " + stakingMemeVault.toString());
    console.log("stakingQuoteVault: " + stakingQuoteVault.toString());

    await sleep(2000);

    const [stakingPool ] = await pool.goLive({
      payer: payer,
      user: payer,
      boundPoolInfo,
      feeDestinationWalletAddress: FEE_DESTINATION_ID,
      memeVault: stakingMemeVault,
      quoteVault: stakingQuoteVault,
    });

    console.log("golive finished. stakingPool: " + stakingPool.id.toString());
  }, 520000);

  //   sleep(1000);

  //   const poolInfo = await pool.fetch();

  //   expect(poolInfo.locked).toBe(true);

  //   const ticketInfo = await ticketId.fetch();

  //   const memesTotal = ticketInfo.amount.add(poolInfo.adminFeesMeme);
  //   expect(memesTotal).toBe(new BN(9e14)); //"total sum of memetokens with fees should amount to 9e14")

  //   const solAmt = poolInfo.solReserve.tokens;
  //   expect(solAmt).toBe(new BN(1 * 1e9)); // "pool should have 300 sol")

  //   const solVault = await client.connection.getAccountInfo(
  //     poolInfo.solReserve.vault,
  //   )

  //   const totalAmt = new BN(solVault?.lamports) - poolInfo.adminFeesSol;
  //   expect(totalAmt).toBe(BigInt(2e11)); //, "pool should have 2 sol without admin fees")
  // }, 120000);

  // it("user swaps more than have", async () => {
  //   const boundPool = await BoundPoolClient.new({admin, payer, signer: payer, client });
  //   await sleep(1000);

  //   const user = new Keypair();

  //  await expect(boundPool.swapY({
  //   memeTokensOut: new BN(1),
  //   user: user,
  //   solAmountIn: new BN(50.5 * 1e9),
  //   userSolAcc: await createWrappedNativeAccount(
  //     client.connection,
  //     payer,
  //     user.publicKey,
  //     5 * 1e9
  //   )
  // })).rejects.toThrow();
  // }, 120000);

  // it("merge tickets presale", async () => {
  //   const user = Keypair.generate()
  //   await airdrop(client.connection, user.publicKey)
  //   const pool = await BoundPoolClient.new({admin, payer, signer: payer, client });

  //   await sleep(1000);

  //   const userSolAcc = await createWrappedNativeAccount(
  //     client.connection,
  //     payer,
  //     user.publicKey,
  //     500 * 10e9
  //   );

  //   const tickets: MemeTicket[] = [];

  //   tickets.push(await pool.swapY({
  //     payer: payer,
  //     user,
  //     userSolAcc,
  //     memeTokensOut: new BN(1),
  //     solAmountIn: new BN(50.5 * 1e9),
  //   }));

  //   tickets.push(await pool.swapY({
  //     payer: payer,
  //     user,
  //     userSolAcc,
  //     memeTokensOut: new BN(1),
  //     solAmountIn: new BN(70.7 * 1e9),
  //   }));

  //   tickets.push(await pool.swapY({
  //     payer: payer,
  //     user,
  //     userSolAcc,
  //     memeTokensOut: new BN(1),
  //     solAmountIn: new BN(181.8 * 1e9),
  //   }));

  //   await tickets[0].boundMerge({
  //     pool: pool.id,
  //     ticketToMerge: tickets[1],
  //     user: user
  //   })

  //   await tickets[0].boundMerge({
  //     pool: pool.id,
  //     ticketToMerge: tickets[2],
  //     user: user
  //   })
  //   sleep(1000);
  // }, 120000);

  // it("swaps user sol->memecoin->sol", async () => {
  //   const user = Keypair.generate()
  //   await airdrop(client.connection, user.publicKey)
  //   const pool = await BoundPoolClient.new({admin, payer, signer: payer, client });

  //   const userSolAcc = await createWrappedNativeAccount(
  //     client.connection,
  //     payer,
  //     user.publicKey,
  //     500 * 10e9
  //   );

  //   await sleep(1000);

  //   const ticketId = await pool.swapY({
  //     user,
  //     memeTokensOut: new BN(1),
  //     solAmountIn: new BN(30 * 1e9),
  //     userSolAcc
  //   });

  //   await sleep(6000);

  //   await pool.swapX({
  //     user,
  //     userMemeTicket: ticketId,
  //     userSolAcc
  //   })
  // }, 120000);

  // it("swaps sol->memecoin->sol->full meme", async () => {
  //   const user = Keypair.generate()
  //   await airdrop(client.connection, user.publicKey)
  //   const pool = await BoundPoolClient.new({admin, payer, signer: payer, client });

  //   const userSolAcc = await createWrappedNativeAccount(
  //     client.connection,
  //     payer,
  //     user.publicKey,
  //     500 * 10e9
  //   );

  //   await sleep(1000);

  //   const userMemeTicket = await pool.swapY({
  //     payer: payer,
  //     user,
  //     memeTokensOut: new BN(1),
  //     solAmountIn: new BN(30 * 1e9),
  //     userSolAcc
  //   });

  //   await sleep(3000);

  //   await pool.swapX({
  //     user,
  //     userMemeTicket,
  //     userSolAcc
  //   })

  //   const ticketId = await pool.swapY({
  //     payer: payer,
  //     user: user,
  //     memeTokensOut: new BN(1),
  //     solAmountIn: new BN(303 * 1e9),
  //   });

  //   await sleep(1000);

  //   const poolInfo = await pool.fetch();

  //   expect(poolInfo.locked).toBe(true) //"pool should be locked")

  //   const ticketOneInfo = await userMemeTicket.fetch();
  //   const ticketInfo = await ticketId.fetch();

  //   const memesTotal = ticketInfo.amount.add(ticketOneInfo.amount).add(poolInfo.adminFeesMeme);
  //   expect(memesTotal).toBe(new BN(9e14)) // "total sum of memetokens with fees should amount to 9e14")

  //   const solAmt = poolInfo.solReserve.tokens;
  //   expect(solAmt.toBe(new BN(3e11))); // "pool should have 300 sol")

  //   const solVault = await getAccount(
  //     client.connection,
  //     poolInfo.solReserve.vault,
  //   )

  //   const totalAmt = solVault.amount - BigInt(poolInfo.adminFeesSol.toNumber());
  //   expect(totalAmt).toBe(BigInt(3e11)); // "pool should have 300 sol without admin fees")
  // }, 120000);
});
