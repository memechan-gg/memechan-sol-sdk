import BN from "bn.js";
import {
  PublicKey,
  SystemProgram,
  Keypair,
  Transaction,
  ComputeBudgetProgram,
  sendAndConfirmTransaction,
} from "@solana/web3.js";
import { COMPUTE_UNIT_PRICE, MEMECHAN_PROGRAM_ID_V2, TOKEN_INFOS } from "../config/config";
import { MemechanClientV2 } from "../MemechanClientV2";

// import { airdrop } from "../common/helpers";

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

  static async new(num: number, denom: number, client: MemechanClientV2, payer: Keypair) {
    const tcdata = await client.memechanProgram.account.chanSwap.fetchNullable(ChanSwapClient.chanSwapId());

    if (tcdata !== null) {
      return;
    }

    // await airdrop(payer.publicKey);
    const { getOrCreateAssociatedTokenAccount } = await import("@solana/spl-token");

    const chanVault = await getOrCreateAssociatedTokenAccount(
      client.connection,
      payer,
      TOKEN_INFOS.CHAN.mint,
      ChanSwapClient.chanSwapSigner(),
      true,
    );

    console.log(chanVault);

    // await mintChan(chanVault.address, 10_000_000 * 10 ** 9);

    const newChanSwapIX = await client.memechanProgram.methods
      .newChanSwap(new BN(num), new BN(denom))
      .accounts({
        chanSwap: ChanSwapClient.chanSwapId(),
        chanSwapSignerPda: ChanSwapClient.chanSwapSigner(),
        chanVault: chanVault.address,
        sender: payer.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .signers([payer])
      .instruction();

    const addPriorityFee = ComputeBudgetProgram.setComputeUnitPrice({
      microLamports: COMPUTE_UNIT_PRICE,
    });
    const tx = new Transaction().add(addPriorityFee, newChanSwapIX);
    const initChanSwapTxResult = await sendAndConfirmTransaction(client.connection, tx, [payer], {
      commitment: "confirmed",
      preflightCommitment: "confirmed",
      skipPreflight: true,
    });

    console.log("initChanSwapTxResult: ", initChanSwapTxResult);
  }
}
