import { connection } from "../../common";
import { getReferrerLink } from "../../../src/points/getReferrerLink";
import { PublicKey } from "@solana/web3.js";

// yarn tsx examples/v2/points/get-referrer-link.ts
(async () => {
  const ownerWalletAddress = new PublicKey("HLaPceN1Hct4qvDC21PetsaVkyUrBC97n1FYeXAZ4mz5");
  console.log(`Owner wallet address: ${ownerWalletAddress.toBase58()}`);

  const referrerLink = await getReferrerLink(connection, ownerWalletAddress.toBase58());
  console.log(`Referrer link: ${referrerLink}`);
})();
