import { Keypair, PublicKey} from "@solana/web3.js";
import { BoundPool } from "../src/bound-pool/BoundPool";
import { sleep } from "../src/common/helpers";
import { BN } from "@coral-xyz/anchor";
import { MemechanClient } from "../src/MemechanClient";
import NodeWallet from "@coral-xyz/anchor/dist/cjs/nodewallet";

describe("BoundPool", () => {

    it("creates bound pool", async () => {
        const admin = new PublicKey(process.env.ADMIN_PUB_KEY as string);
        const payer =  Keypair.fromSecretKey(Buffer.from(JSON.parse(process.env.TEST_PAYER_SECRET_KEY as string)));
        const wallet = new NodeWallet(payer);
        const client = new MemechanClient(wallet);
        const boundPool = await BoundPool.new({admin, payer, signer: payer, client });
        await sleep(1000);
        const info = await boundPool.fetch();
        console.log(info);
      }, 60000)

    // it("full swap then go live", async () => {

    //     const admin = new PublicKey(process.env.ADMIN_PUB_KEY as string);
    //     const payer =  Keypair.fromSecretKey(Buffer.from(JSON.parse(process.env.TEST_USER_SECRET_KEY as string)));
    //     const wallet = new NodeWallet(payer);
    //     const client = new MemechanClient(wallet);

    //     const pool = await BoundPool.new({admin, payer, signer: payer, client });

    //     await sleep(1000);

    //     // const ticketId = await pool.swapY({
    //     //     payer: payer,
    //     //     memeTokensOut: new BN(1),
    //     //     solAmountIn: new BN(1),
    //     //     user: user
    //     // });

    //     //console.log("ticketId: " + ticketId);
    //     // await pool.goLive({
    //     //   payer: payer,
    //     //   user: payer,
    //     // })

    // }, 120000);
});
