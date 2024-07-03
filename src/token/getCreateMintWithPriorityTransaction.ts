import { ComputeBudgetProgram, Connection, Keypair, PublicKey, SystemProgram, Transaction } from "@solana/web3.js";
import { COMPUTE_UNIT_PRICE } from "../config/config";

/**
 * Get a transaction for creating and initializing a new mint
 *
 * @param connection      Connection to use
 * @param payer           Payer of the transaction and initialization fees
 * @param mintAuthority   Account or multisig that will control minting
 * @param freezeAuthority Optional account or multisig that can freeze token accounts
 * @param decimals        Location of the decimal place
 * @param keypair         Optional keypair, defaulting to a new random one
 *
 * @return Transaction for creating and initializing a new mint
 */
export async function getCreateMintWithPriorityTransaction(
  connection: Connection,
  payer: PublicKey,
  mintAuthority: PublicKey,
  freezeAuthority: PublicKey | null,
  decimals: number,
  keypair = Keypair.generate(),
): Promise<Transaction> {
  const modifyComputeUnits = ComputeBudgetProgram.setComputeUnitLimit({
    units: 250_000,
  });

  const addPriorityFee = ComputeBudgetProgram.setComputeUnitPrice({
    microLamports: COMPUTE_UNIT_PRICE,
  });
  const { MINT_SIZE, TOKEN_PROGRAM_ID, createInitializeMintInstruction } = await import("@solana/spl-token");
  console.log("mintAuthority: " + mintAuthority.toBase58());

  const createMintAccountInstruction = SystemProgram.createAccount({
    fromPubkey: payer,
    newAccountPubkey: keypair.publicKey,
    lamports: await connection.getMinimumBalanceForRentExemption(MINT_SIZE),
    space: MINT_SIZE,
    programId: TOKEN_PROGRAM_ID,
  });

  const initializeMintInstruction = createInitializeMintInstruction(keypair.publicKey, decimals, mintAuthority, null);

  const transaction = new Transaction().add(
    modifyComputeUnits,
    addPriorityFee,
    createMintAccountInstruction,
    initializeMintInstruction,
  );

  return transaction;
}
