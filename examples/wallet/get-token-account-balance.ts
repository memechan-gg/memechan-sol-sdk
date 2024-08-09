import { ASSOCIATED_TOKEN_PROGRAM_ID, getAssociatedTokenAddressSync } from "@solana/spl-token";
import { connection } from "../common";
import { PublicKey } from "@solana/web3.js";
import { TOKEN_INFOS } from "../../src";
import { TOKEN_PROGRAM_ID } from "../../src/config/consts";

// yarn tsx examples/wallet/get-token-balance.ts
(async () => {
  const ownerWalletAddress = new PublicKey("HLaPceN1Hct4qvDC21PetsaVkyUrBC97n1FYeXAZ4mz5");

  const ata = getAssociatedTokenAddressSync(
    TOKEN_INFOS.CHAN.mint,
    ownerWalletAddress,
    true,
    TOKEN_PROGRAM_ID,
    ASSOCIATED_TOKEN_PROGRAM_ID,
  );
  const info = await connection.getTokenAccountBalance(ata);
  console.log("info: ", info);
})();
