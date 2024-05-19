import { Keypair, PublicKey } from "@solana/web3.js";
import { BoundPool } from "../src/bound-pool/BoundPool";
import { airdrop, sleep } from "../src/common/helpers";
import { BN } from "@coral-xyz/anchor";
import { MemechanClient } from "../src/MemechanClient";
import NodeWallet from "@coral-xyz/anchor/dist/cjs/nodewallet";
import { createWrappedNativeAccount, getAccount } from "@solana/spl-token";
import { MemeTicket } from "../src/memeticket/MemeTicket";
import { StakingPool } from "../src/staking-pool/StakingPool";

describe("MemeTicket", () => {

  it.skip("all", async() => {
    const payer = Keypair.fromSecretKey(Buffer.from(JSON.parse(process.env.TEST_USER_SECRET_KEY as string)));
    console.log("payer: " + payer.publicKey.toString());

    const wallet = new NodeWallet(payer);
    const client = new MemechanClient(wallet);
    const all = await MemeTicket.all(client.memechanProgram);

    for (const pool of all) {
      //console.log(JSON.stringify(pool.account));
      //console.log("==================================================");
    }
  }, 30000);
});