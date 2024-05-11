import { assert, expect } from "chai";
import { BoundPool } from "../bound_pool";
import { AccountMeta, Keypair, PublicKey } from "@solana/web3.js";
import { createAccount, createWrappedNativeAccount, getAccount } from "@solana/spl-token";
import { memechan, payer, provider, sleep } from "../helpers";
import { BN } from "@project-serum/anchor";

export function test() {
  describe("swap_x", () => {

    it("swaps user sol->memecoin->sol", async () => {
      const user = Keypair.generate();
      const pool = await BoundPool.new();

      const userSolAcc = await createWrappedNativeAccount(
        provider.connection,
        payer,
        user.publicKey,
        500 * 10e9
      );

      await sleep(1000);

      const ticketId = await pool.swap_y({
        user,
        memeTokensOut: new BN(1),
        solAmountIn: new BN(30 * 1e9),
        userSolAcc
      });

      await sleep(6000);

      await pool.swap_x({
        user,
        userMemeTicket: ticketId,
        userSolAcc
      })
    });

    it("swaps sol->memecoin->sol->full meme", async () => {
      const user = Keypair.generate();
      const pool = await BoundPool.new();

      const userSolAcc = await createWrappedNativeAccount(
        provider.connection,
        payer,
        user.publicKey,
        500 * 10e9
      );

      await sleep(1000);

      const userMemeTicket = await pool.swap_y({
        user,
        memeTokensOut: new BN(1),
        solAmountIn: new BN(30 * 1e9),
        userSolAcc
      });

      await sleep(6000);

      await pool.swap_x({
        user,
        userMemeTicket,
        userSolAcc
      })

      const ticketId = await pool.swap_y({
        memeTokensOut: new BN(1),
        solAmountIn: new BN(303 * 1e9),
      });

      await sleep(1000);

      const poolInfo = await pool.fetch();

      assert(poolInfo.locked, "pool should be locked")

      const ticketOneInfo = await userMemeTicket.fetch();
      const ticketInfo = await ticketId.fetch();

      const memesTotal = ticketInfo.amount.add(ticketOneInfo.amount).add(poolInfo.adminFeesMeme);
      assert(memesTotal.eq(new BN(9e14)), "total sum of memetokens with fees should amount to 9e14")

      const solAmt = poolInfo.solReserve.tokens;
      assert(solAmt.eq(new BN(3e11)), "pool should have 300 sol")

      const solVault = await getAccount(
        provider.connection,
        poolInfo.solReserve.vault,
      )

      const totalAmt = solVault.amount - BigInt(poolInfo.adminFeesSol.toNumber());
      assert(totalAmt === BigInt(3e11), "pool should have 300 sol without admin fees")
    });

  });

}
