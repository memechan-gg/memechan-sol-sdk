import { PublicKey, Keypair, sendAndConfirmTransaction, Connection, ComputeBudgetProgram } from "@solana/web3.js";
import BN from "bn.js";
import AmmImpl from "@0xunreal/dynamic-amm-sdk";
import { COMPUTE_UNIT_PRICE, MEMECHAN_MEME_TOKEN_DECIMALS, TOKEN_INFOS } from "../config/config";

export class AmmPool {
  async swap(user: Keypair, amountIn: number, amountOut: number, connection: Connection) {
    const swapTx = await this.ammImpl.swap(
      user.publicKey,
      this.quoteMint,
      new BN(amountIn * 10 ** TOKEN_INFOS.WSOL.decimals),
      new BN(amountOut * 10 ** MEMECHAN_MEME_TOKEN_DECIMALS),
    );

    const addPriorityFee = ComputeBudgetProgram.setComputeUnitPrice({
      microLamports: COMPUTE_UNIT_PRICE,
    });

    swapTx.instructions.unshift(addPriorityFee);

    console.log(
      "swap tx",
      await sendAndConfirmTransaction(connection, swapTx, [user], {
        commitment: "confirmed",
        skipPreflight: true,
        preflightCommitment: "confirmed",
      }),
    );
  }

  public constructor(
    public id: PublicKey,
    public memeMint: PublicKey,
    public quoteMint: PublicKey,
    public ammImpl: AmmImpl,
  ) {}
}
