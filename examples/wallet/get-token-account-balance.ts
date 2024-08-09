import { ASSOCIATED_TOKEN_PROGRAM_ID, getAssociatedTokenAddressSync } from "@solana/spl-token";
import { connection } from "../common";
import { PublicKey } from "@solana/web3.js";
import { TOKEN_INFOS } from "../../src";
import { TOKEN_PROGRAM_ID } from "../../src/config/consts";

// yarn tsx examples/wallet/get-token-account-balance.ts
(async () => {
  const ownerWalletAddress = new PublicKey("5dsHxqEueQ6nvDopUUKihvQtpm7LWcbw2wCSPtRyAEb1");

  const ataAddress = getAssociatedTokenAddressSync(
    TOKEN_INFOS.CHAN.mint,
    ownerWalletAddress,
    true,
    TOKEN_PROGRAM_ID,
    ASSOCIATED_TOKEN_PROGRAM_ID,
  );
  const ata = await connection.getAccountInfo(ataAddress);
  console.log("ata: ", ata);
  if (ata) {
    const info = await connection.getTokenAccountBalance(ataAddress);
    console.log("info: ", info);
  } else {
    console.log("ata not found");
  }
})();
