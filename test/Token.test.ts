import NodeWallet from "@coral-xyz/anchor/dist/cjs/nodewallet";
import { Keypair, PublicKey } from "@solana/web3.js";
import { MemechanClient } from "../src/MemechanClient";
import { initializeCounter } from "../src/token/initializeCounter";

describe("Token", () => {

    it("initialize counter", async () => {
        const payer =  Keypair.fromSecretKey(Buffer.from(JSON.parse(process.env.TEST_USER_SECRET_KEY as string)));
        const wallet = new NodeWallet(payer);
        const client = new MemechanClient(wallet);
       
        initializeCounter(client, payer)

      }, 60000);
});