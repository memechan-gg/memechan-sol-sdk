import { PublicKey, Keypair } from "@solana/web3.js";
import { getAccount } from "@solana/spl-token";
import { BN } from "@coral-xyz/anchor";
import { MemechanClient } from "../MemechanClient";

export class AmmPool {
  public constructor(
    public id: PublicKey,
    public tollAuthority: PublicKey,
    public client: MemechanClient,
  ) {
    //
  }

  public static findSignerPda(publicKey: PublicKey, ammProgramId: PublicKey): PublicKey {
    return PublicKey.findProgramAddressSync([Buffer.from("signer"), publicKey.toBytes()], ammProgramId)[0];
  }

  public async fetch() {
    return this.client.ammProgram.account.pool.fetch(this.id);
  }

  public async swap(user: Keypair, sellWallet: PublicKey, buyWallet: PublicKey, sell: number, minBuy: number) {
    const pool = await this.fetch();
    const getVaultOfWallet = async (wallet: PublicKey) => {
      const { mint } = await getAccount(this.client.connection, wallet);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const reserves = pool.reserves as any[];
      return reserves.find((r) => r.mint.toBase58() === mint.toBase58()).vault;
    };

    await this.client.ammProgram.methods
      .swap({ amount: new BN(sell) }, { amount: new BN(minBuy) })
      .accounts({
        user: user.publicKey,
        discount: this.discountAddress(user.publicKey),
        sellWallet,
        sellVault: await getVaultOfWallet(sellWallet),
        buyWallet,
        buyVault: await getVaultOfWallet(buyWallet),
        pool: this.id,
        poolSigner: this.findSignerPda(),
        programTollWallet: pool.programTollWallet,
        lpMint: pool.mint,
      })
      .signers([user])
      .rpc();
  }

  public findSignerPda(): PublicKey {
    return AmmPool.findSignerPda(this.id, this.client.ammProgram.programId);
  }

  public discountAddress(user: PublicKey): PublicKey {
    const [discountSettings] = PublicKey.findProgramAddressSync(
      [Buffer.from("discount"), user.toBuffer()],
      this.client.ammProgram.programId,
    );
    return discountSettings;
  }
}
