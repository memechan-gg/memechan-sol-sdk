import BN from "bn.js";
import { adminSigner, airdrop, mintChan, payer } from "./helpers";
import { client } from "./common";
import { CHAN_TOKEN_INFO, memechan } from "./sol-sdk/config/config";
import { SystemProgram } from "@solana/web3.js";
import { getOrCreateAssociatedTokenAccount } from "@solana/spl-token";

export class ChanSwapClient {
  static chanSwapId(): PublicKey {
    return PublicKey.findProgramAddressSync([Buffer.from("chan_swap")], memechan.programId)[0];
  }

  static chanSwapSigner(): PublicKey {
    return PublicKey.findProgramAddressSync([Buffer.from("chan_swap_signer")], memechan.programId)[0];
  }

  static async new(num: number = 1, denom: number = 1000) {
    const tcdata = await memechan.account.chanSwap.fetchNullable(ChanSwapClient.chanSwapId());

    if (tcdata !== null) {
      return;
    }

    await airdrop(adminSigner.publicKey);

    const chanVault = await getOrCreateAssociatedTokenAccount(
      client.connection,
      payer,
      new PublicKey(CHAN_TOKEN_INFO.address),
      ChanSwapClient.chanSwapSigner(),
      true,
    );

    console.log(chanVault);

    await mintChan(chanVault.address, 10_000_000 * 10 ** 9);

    await memechan.methods
      .newChanSwap(new BN(num), new BN(denom))
      .accounts({
        chanSwap: ChanSwapClient.chanSwapId(),
        chanSwapSignerPda: ChanSwapClient.chanSwapSigner(),
        chanVault: chanVault.address,
        sender: adminSigner.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .signers([adminSigner])
      .rpc({ skipPreflight: true });
  }
}
