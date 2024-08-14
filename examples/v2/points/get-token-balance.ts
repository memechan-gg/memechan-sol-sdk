import { POINTS_MINT, TOKEN_INFOS } from "../../../src";
import { connection, payer } from "../../common";
import { getTokenBalance } from "../../../src/util/getTokenBalance";
import BigNumber from "bignumber.js";

// yarn tsx examples/v2/points/get-token-balance.ts
(async () => {
  const ownerWalletAddress = payer.publicKey;
  console.log(`Owner wallet address: ${ownerWalletAddress.toBase58()}`);
  const mintAddress = POINTS_MINT;

  try {
    const balance = await getTokenBalance(connection, mintAddress, ownerWalletAddress);

    console.log(`Token balance lamports : ${balance}`);
    const formattedBalance = balance ? new BigNumber(balance).div(10 ** TOKEN_INFOS.POINT.decimals) : null;

    if (balance !== null) {
      console.log(`Token balance for ${mintAddress}: ${formattedBalance}`);
    } else {
      console.log(`No Associated Token Account found for ${TOKEN_INFOS.POINT.symbol}`);
    }
  } catch (error) {
    console.error("Error:", error);
  }
})();
