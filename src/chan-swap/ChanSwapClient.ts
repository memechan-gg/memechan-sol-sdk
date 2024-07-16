import BN from "bn.js";
import {
  PublicKey,
  SystemProgram,
  Keypair,
  Transaction,
  ComputeBudgetProgram,
  sendAndConfirmTransaction,
} from "@solana/web3.js";
import { MemechanClientV2 } from "../MemechanClientV2";
import { getConfig } from "../config/config";
import { COMPUTE_UNIT_PRICE } from "../config/consts";

// import { airdrop } from "../common/helpers";

export class ChanSwapClient {
  static async chanSwapId(): Promise<PublicKey> {
    const { MEMECHAN_PROGRAM_ID_V2 } = await getConfig();
    return PublicKey.findProgramAddressSync([Buffer.from("chan_swap")], new PublicKey(MEMECHAN_PROGRAM_ID_V2))[0];
  }

  static async chanSwapSigner(): Promise<PublicKey> {
    const { MEMECHAN_PROGRAM_ID_V2 } = await getConfig();
    return PublicKey.findProgramAddressSync(
      [Buffer.from("chan_swap_signer")],
      new PublicKey(MEMECHAN_PROGRAM_ID_V2),
    )[0];
  }

  static async new(num: number, denom: number, client: MemechanClientV2, payer: Keypair) {
    const chanSwapId = await ChanSwapClient.chanSwapId();
    const tcdata = await client.memechanProgram.account.chanSwap.fetchNullable(chanSwapId);

    if (tcdata !== null) {
      return;
    }

    // await airdrop(payer.publicKey);
    const { getOrCreateAssociatedTokenAccount } = await import("@solana/spl-token");
    const { TOKEN_INFOS } = await getConfig();

    const signer = await ChanSwapClient.chanSwapSigner();
    const chanVault = await getOrCreateAssociatedTokenAccount(
      client.connection,
      payer,
      TOKEN_INFOS.CHAN.mint,
      signer,
      true,
    );

    console.log(chanVault);

    // await mintChan(chanVault.address, 10_000_000 * 10 ** 9);

    const newChanSwapIX = await client.memechanProgram.methods
      .newChanSwap(new BN(num), new BN(denom))
      .accounts({
        chanSwap: await ChanSwapClient.chanSwapId(),
        chanSwapSignerPda: await ChanSwapClient.chanSwapSigner(),
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
