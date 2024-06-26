import BN from "bn.js";
import { PublicKey, SystemProgram, Keypair } from "@solana/web3.js";
import { getOrCreateAssociatedTokenAccount } from "@solana/spl-token";
import { MEMECHAN_PROGRAM_ID_V2, TOKEN_INFOS } from "../config/config";
import { MemechanClientV2 } from "../MemechanClientV2";

import { airdrop } from "../common/helpers";

export class ChanSwapClient {
  static chanSwapId(): PublicKey {
    return PublicKey.findProgramAddressSync([Buffer.from("chan_swap")], new PublicKey(MEMECHAN_PROGRAM_ID_V2))[0];
  }

  static chanSwapSigner(): PublicKey {
    return PublicKey.findProgramAddressSync(
      [Buffer.from("chan_swap_signer")],
      new PublicKey(MEMECHAN_PROGRAM_ID_V2),
    )[0];
  }

  static async new(num: number = 1, denom: number = 1000, client: MemechanClientV2, payer: Keypair) {
    const tcdata = await client.memechanProgram.account.chanSwap.fetchNullable(ChanSwapClient.chanSwapId());

    if (tcdata !== null) {
      return;
    }

    await airdrop(payer.publicKey);

    const chanVault = await getOrCreateAssociatedTokenAccount(
      client.connection,
      payer,
      TOKEN_INFOS.CHAN.mint,
      ChanSwapClient.chanSwapSigner(),
      true,
    );

    console.log(chanVault);

    await mintChan(chanVault.address, 10_000_000 * 10 ** 9);

    await client.memechanProgram.methods
      .newChanSwap(new BN(num), new BN(denom))
      .accounts({
        chanSwap: ChanSwapClient.chanSwapId(),
        chanSwapSignerPda: ChanSwapClient.chanSwapSigner(),
        chanVault: chanVault.address,
        sender: payer.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .signers([payer])
      .rpc({ skipPreflight: true });
  }
}
