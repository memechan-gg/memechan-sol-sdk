import { PublicKey, Keypair, sendAndConfirmTransaction, Connection } from "@solana/web3.js";
import BN from "bn.js";
import AmmImpl from "@mercurial-finance/dynamic-amm-sdk";

export class AmmPool {
  async swap(user: Keypair, amountIn: number, amountOut: number, connection: Connection) {
    const swapTx = await this.ammImpl.swap(user.publicKey, this.quoteMint, new BN(amountIn), new BN(amountOut));

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
