import { Connection, Keypair, PublicKey, SystemProgram, Transaction } from '@solana/web3.js';

// Constants similar to Rust's static seeds
// TypeScript constants equivalent to Rust's byte array constants
export const AUTHORITY_AMM = Buffer.from("amm authority");
export const AMM_ASSOCIATED_SEED = Buffer.from("amm_associated_seed");
export const TARGET_ASSOCIATED_SEED = Buffer.from("target_associated_seed");
export const OPEN_ORDER_ASSOCIATED_SEED = Buffer.from("open_order_associated_seed");
export const COIN_VAULT_ASSOCIATED_SEED = Buffer.from("coin_vault_associated_seed");
export const PC_VAULT_ASSOCIATED_SEED = Buffer.from("pc_vault_associated_seed");
export const LP_MINT_ASSOCIATED_SEED = Buffer.from("lp_mint_associated_seed");
export const AMM_CONFIG_SEED = Buffer.from("amm_config_account_seed");

/**
 * Function to find a program-derived address and bump seed using provided seeds.
 * @param infoId Public key related to the info ID.
 * @param marketAddress Public key of the market address.
 * @param associatedSeed Seed used for generating the PDA.
 * @param programId Public key of the program.
 * @returns A promise that resolves to a tuple containing the PDA and bump seed.
 */
export function getAssociatedAddressAndBumpSeed(
    infoId: PublicKey,
    marketAddress: PublicKey,
    associatedSeed: Buffer,
    programId: PublicKey
): [PublicKey, number] {
    return PublicKey.findProgramAddressSync(
        [infoId.toBuffer(), marketAddress.toBuffer(), associatedSeed],
        programId
    );
}


/**
 * Create the associated account if it does not exist.
 * @param connection The Solana connection object.
 * @param payer The payer Keypair who will pay for the transaction.
 * @param infoId The public key related to the info ID.
 * @param marketAddress The public key of the market address.
 * @param associatedSeed The seed used for generating the PDA.
 * @param programId The public key of the program.
 */
export async function createAssociatedAccountIfNeeded(
    connection: Connection,
    payer: Keypair,
    infoId: PublicKey,
    marketAddress: PublicKey,
    associatedSeed: Buffer,
    programId: PublicKey
): Promise<void> {
    // Calculate the PDA
    const [associatedAddress, bumpSeed] = PublicKey.findProgramAddressSync(
        [infoId.toBuffer(), marketAddress.toBuffer(), associatedSeed],
        programId
    );

    // Check if the account already exists
    const accountInfo = await connection.getAccountInfo(associatedAddress);

    if (accountInfo === null) {
        // Account does not exist, create it
        console.log('Account does not exist, creating it... associatedAddress: ' + associatedAddress.toBase58() + ' bumpSeed: ' + bumpSeed);
        const lamports = await connection.getMinimumBalanceForRentExemption(0); // Adjust size as needed

        const createAccountInstruction = SystemProgram.createAccount({
            fromPubkey: payer.publicKey,
            newAccountPubkey: associatedAddress,
            lamports: lamports,
            space: 0, // Adjust size as needed
            programId: programId,
        });

        const transaction = new Transaction().add(createAccountInstruction);
        await connection.sendTransaction(transaction, [payer], { skipPreflight: false, preflightCommitment: 'confirmed' });
        console.log('Account created successfully:', associatedAddress.toBase58());
    } else {
        console.log('Account already exists:', associatedAddress.toBase58());
    }
}

