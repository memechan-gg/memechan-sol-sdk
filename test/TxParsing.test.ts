import * as solana from "@solana/web3.js"
import * as anchor from "@coral-xyz/anchor"
import { ParseTx } from "../src/tx-parsing/parsing"
import { MemechanClient } from "../src/MemechanClient";

describe("Tx Parsing", () => {
    it("all", async () => {

        const txSigs = [
            "2VdDDYqwqt91r7PzeBdt4ZKLoR6sqyZnY29EoMZC9vXVahocHYS9rmuTSNc9opUjZPQQdpZu9mV4yiLUgqRWbMW2", // new 
            "Tp3CNg1Y7ep3rTyCqfAVA2jNDbQ5eyzt9bhBEbSkZJdvjCmDmhSJ4PpCB4fDShGzWYS4kHLdpZaykk8acX1hdSC",  // swapY
            "31LuwD66Uy6msxy1XGSX2epxvp3qc9CCWHwudQFkABuJZ5RXSfv1h2RwqbMM4YovvugbzkGHxxVchtVxAKFfQhpC", // swapX
            "5H2yQkoK1kKkRLZ7VD38oBVsuA52hzKdUghBPjZu4jUvuDsykzZTeNeaFfkL3X6FfEuYbYx62E89NWGAabAq38md", // InitStakingPool
            "2VZQsKybUVF1QDpVpa19nW2XXw5faZApVknAvr1kRHeVAQVVY73KzVcoHFsXQQ3zzDsdTKK5ui8euDdERJr3vwAb", // GoLive
        ];

        const client = new MemechanClient(new anchor.Wallet(solana.Keypair.generate()));

        for (let i = 0; i < txSigs.length; i++) {
            console.log(await ParseTx(txSigs[i], client));
        }
    });
});
