import { Keypair, PublicKey} from "@solana/web3.js";
import { BoundPool } from "../src/bound-pool/BoundPool";
import { airdrop, sleep } from "../src/common/helpers";
import { BN } from "@coral-xyz/anchor";
import { MemechanClient } from "../src/MemechanClient";
import NodeWallet from "@coral-xyz/anchor/dist/cjs/nodewallet";
import { createWrappedNativeAccount, getAccount } from "@solana/spl-token";
import { MemeTicket } from "../src/memeticket/MemeTicket";

describe("BoundPool", () => {

    // it("creates bound pool", async () => {

    //     const admin = new PublicKey(process.env.ADMIN_PUB_KEY as string);
    //     const payer =  Keypair.fromSecretKey(Buffer.from(JSON.parse(process.env.TEST_USER_SECRET_KEY as string)));
    //     const wallet = new NodeWallet(payer);
    //     const client = new MemechanClient(wallet);
    //     const boundPool = await BoundPool.new({admin, payer, signer: payer, client });
    //     await sleep(1000);
    //     const info = await boundPool.fetch();
    //     console.log(info);
    //   }, 60000)

    it("init staking pool then go live", async () => {

      // const raydiumkp = Keypair.fromSecretKey(Buffer.from(JSON.parse("[11,63,99,38,79,49,253,45,205,89,6,148,111,194,129,235,207,25,238,87,106,178,75,235,71,17,67,163,210,72,47,211,3,207,201,4,73,43,8,191,154,91,241,223,80,204,53,60,15,16,240,204,136,152,51,51,70,161,64,167,77,126,212,131]")));
      // console.log("raydium: " + raydiumkp.publicKey.toString());

      // const openbookkp = Keypair.fromSecretKey(Buffer.from(JSON.parse("[250,223,201,253,182,245,189,248,215,189,232,89,83,27,240,8,202,229,229,95,52,96,100,10,14,194,34,93,138,237,227,148,64,138,99,86,118,183,211,245,244,117,158,207,79,208,42,164,211,55,0,173,7,221,248,140,5,229,117,193,47,132,45,253]")));
      // console.log("openbook: " + openbookkp.publicKey.toString());

      // const kp =  Keypair.fromSecretKey(Buffer.from(JSON.parse("[140,88,27,17,68,17,132,100,69,77,220,22,208,196,135,223,135,45,138,133,90,24,137,69,245,20,235,112,11,31,89,66,171,81,158,101,221,254,251,34,39,149,251,131,165,133,201,50,182,183,50,8,46,61,119,177,76,15,138,80,146,216,107,243]")));
      // console.log("kp: " + kp.publicKey.toString());

      // const adminkp =  Keypair.fromSecretKey(Buffer.from(JSON.parse("[80,239,181,197,248,185,58,19,215,210,131,26,3,183,94,9,129,1,105,246,46,103,129,228,93,177,231,112,199,187,244,121,110,68,66,192,182,118,18,95,192,154,120,228,122,51,31,211,174,13,150,37,117,138,50,246,238,61,71,100,122,150,186,237]")));
      // console.log("admin: " + adminkp.publicKey.toString());
      // return;

        const admin = new PublicKey(process.env.ADMIN_PUB_KEY as string);
        const payer =  Keypair.fromSecretKey(Buffer.from(JSON.parse(process.env.TEST_USER_SECRET_KEY as string)));
        console.log("payer: " + payer.publicKey.toString());
       // return;

        const wallet = new NodeWallet(payer);
        const client = new MemechanClient(wallet);

        const pool = await BoundPool.new({admin, payer, signer: payer, client });

        await sleep(1000);

        const ticketId = await pool.swapY({
            payer: payer,
            user: payer,
            memeTokensOut: new BN(1),
            solAmountIn: new BN(1 * 1e9),
        });

        console.log("swapY ticketId: " + ticketId);

        const boundPoolInfo = await pool.fetch();

        await pool.initStakingPool({
          payer: payer,
          user: payer,
          boundPoolInfo
        });

        await sleep(1000);

        await pool.goLive({
          payer: payer,
          user: payer,
          boundPoolInfo
        })

    }, 320000);

    // it("swaps full sol->memecoin in one go", async () => {
    //    const admin = new PublicKey(process.env.ADMIN_PUB_KEY as string);
    //     const payer =  Keypair.fromSecretKey(Buffer.from(JSON.parse(process.env.TEST_USER_SECRET_KEY as string)));
    //     const wallet = new NodeWallet(payer);
    //     const client = new MemechanClient(wallet);

    //     const pool = await BoundPool.new({admin, payer, signer: payer, client });

    //     await sleep(1000);

    //   // call to the swap endpoint
    //   const ticketId = await pool.swapY({
    //     payer: payer,
    //     user: payer,
    //     memeTokensOut: new BN(1),
    //     solAmountIn: new BN(2 * 1e9),
    //   });

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
    //   const admin = new PublicKey(process.env.ADMIN_PUB_KEY as string);
    //   const payer =  Keypair.fromSecretKey(Buffer.from(JSON.parse(process.env.TEST_USER_SECRET_KEY as string)));
    //   const wallet = new NodeWallet(payer);
    //   const client = new MemechanClient(wallet);
    //   const boundPool = await BoundPool.new({admin, payer, signer: payer, client });
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
    //   const admin = new PublicKey(process.env.ADMIN_PUB_KEY as string);
    //   const payer =  Keypair.fromSecretKey(Buffer.from(JSON.parse(process.env.TEST_USER_SECRET_KEY as string)));
    //   const wallet = new NodeWallet(payer);
    //   const client = new MemechanClient(wallet);

    //   const user = Keypair.generate()
    //   await airdrop(client.connection, user.publicKey)
    //   const pool = await BoundPool.new({admin, payer, signer: payer, client });

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
    //   const admin = new PublicKey(process.env.ADMIN_PUB_KEY as string);
    //   const payer =  Keypair.fromSecretKey(Buffer.from(JSON.parse(process.env.TEST_USER_SECRET_KEY as string)));
    //   const wallet = new NodeWallet(payer);
    //   const client = new MemechanClient(wallet);

    //   const user = Keypair.generate()
    //   await airdrop(client.connection, user.publicKey)
    //   const pool = await BoundPool.new({admin, payer, signer: payer, client });

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
    //   const admin = new PublicKey(process.env.ADMIN_PUB_KEY as string);
    //   const payer =  Keypair.fromSecretKey(Buffer.from(JSON.parse(process.env.TEST_USER_SECRET_KEY as string)));
    //   const wallet = new NodeWallet(payer);
    //   const client = new MemechanClient(wallet);

    //   const user = Keypair.generate()
    //   await airdrop(client.connection, user.publicKey)
    //   const pool = await BoundPool.new({admin, payer, signer: payer, client });

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
