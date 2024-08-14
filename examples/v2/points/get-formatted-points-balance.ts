import { PublicKey } from "@solana/web3.js";
import { getFormattedPointsBalance } from "../../../src";
import { connection } from "../../common";

// yarn tsx examples/v2/points/get-formatted-points-balance-example.ts
(async () => {
  const ownerWalletAddress = new PublicKey("Brxu9CEALxhqJVkx8GzPSbuvkP1EfnyipSoQmKuTSPZ1");

  try {
    const formattedBalance = await getFormattedPointsBalance(connection, ownerWalletAddress);

    if (formattedBalance !== null) {
      console.log(`Formatted POINTS balance: ${formattedBalance.toFixed()} POINTS`);
    } else {
      console.log("No Associated Token Account found for POINTS");
    }
  } catch (error) {
    console.error("Error:", error);
  }
})();
