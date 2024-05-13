import { MemechanClient } from "../../MemechanClient";

export async function createTokenWithMetadata(client: MemechanClient, metadata = {
    name: "Example Token",
    url: "https://example.com",
    ticker: "EXTK",
    description: "An example token",
    twitter: "https://twitter.com/example",
    discord: "https://discord.gg/example"
}
) {

    try {
        const tx = await client.memechanProgram.createTokenWithMetadata(metadata, {
            accounts: {
                counter: counter.publicKey,
                metadata: metadataAccount.publicKey,
                payer: provider.wallet.publicKey,
                systemProgram: SystemProgram.programId,
                tokenProgram: TOKEN_PROGRAM_ID,
                rent: SYSVAR_RENT_PUBKEY,
            },
        });
        console.log("Transaction signature", tx);
    } catch (error) {
        console.error("Error minting token", error);
  }
}