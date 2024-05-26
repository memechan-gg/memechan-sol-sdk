import { LoadBalancedConnection } from "../../src/multiendpoint-client/loadBalancedConnection";
import { endpoints } from "./endpoints";
import { PublicKey } from "@solana/web3.js";

// Example
// yarn tsx examples/load-balanced-connection/example.ts
(async () => {
  const publicKey = new PublicKey("TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA");
  const loadBalancedConnection = new LoadBalancedConnection(endpoints);

  try {
    const accountInfo = await loadBalancedConnection.getAccountInfo(publicKey);
    console.log("Account Info:", accountInfo);
  } catch (error) {
    console.error("Failed to fetch account info:", error);
  }

  try {
    const slot = await loadBalancedConnection.getSlot();
    console.log("Current slot:", slot);
  } catch (error) {
    console.error("Failed to fetch slot info:", error);
  }
})();
