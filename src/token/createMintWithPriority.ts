import type { ConfirmOptions, Connection, PublicKey, Signer } from "@solana/web3.js";
import { Keypair, sendAndConfirmTransaction } from "@solana/web3.js";
import { getCreateMintWithPriorityTransaction } from "./getCreateMintWithPriorityTransaction";

/* Create and initialize a new mint
 *
 * @param connection      Connection to use
 * @param payer           Payer of the transaction and initialization fees
 * @param mintAuthority   Account or multisig that will control minting
 * @param freezeAuthority Optional account or multisig that can freeze token accounts
 * @param decimals        Location of the decimal place
 * @param keypair         Optional keypair, defaulting to a new random one
 * @param confirmOptions  Options for confirming the transaction
 * @param programId       SPL Token program account
 *
 * @return Address of the new mint
 */
export async function createMintWithPriority(
  connection: Connection,
  payer: Signer,
  mintAuthority: PublicKey,
  freezeAuthority: PublicKey | null,
  decimals: number,
  keypair = Keypair.generate(),
  confirmOptions?: ConfirmOptions,
): Promise<PublicKey> {
  const transaction = await getCreateMintWithPriorityTransaction(
    connection,
    payer.publicKey,
    mintAuthority,
    freezeAuthority,
    decimals,
    keypair,
  );

  const result = await sendAndConfirmTransaction(connection, transaction, [payer, keypair], confirmOptions);
  console.log("create mint result: " + result);

  return keypair.publicKey;
}
