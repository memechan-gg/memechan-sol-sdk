import { PublicKey } from "@solana/web3.js";
import { getSignatures } from "../helius-api/utils/getSignatures";
import { Connection } from "@solana/web3.js";
import { HeliusApiInstance } from "../../examples/common";

export async function filterByActivity(
  connection: Connection,
  addresses: PublicKey[],
  recentActivityPeriod = 86_400 * 14, // 14 days in seconds
) {
  const activeAddresses: PublicKey[] = [];

  for (let i = 0; i < addresses.length; i++) {
    const address = addresses[i];

    const signaturesProvider = getSignatures({
      connection,
      job: "findSignatureByPubkey",
      publicKey: address,
      limit: 50,
    });

    for await (const signatures of signaturesProvider) {
      if (!signatures.length) {
        console.log("[insertMissingAutoCompoundTransactions] no signatures ...");
        break;
      }
      try {
        const parsedTxs = await HeliusApiInstance.getAllParsedTransactions({ signatures });
        console.log(`list len ${parsedTxs.parsedDataListSize}`);
        if (parsedTxs.parsedDataListSize != 0) {
          const signedTxs = parsedTxs.parsedDataList.filter((ptx) => ptx.feePayer === address.toBase58());
          if (signedTxs.length == 0) continue;

          const parsedMaxTs = Math.max(...signedTxs.map((ptx) => ptx.timestamp));
          console.log(`max ts ${parsedMaxTs}`);
          if (parsedMaxTs + recentActivityPeriod > Date.now() / 1000) {
            activeAddresses.push(address);
            console.log(`found address: ${address}`);
          }
        }
      } catch (e) {
        console.warn(`[filterByActivity] couldn't get parsed transactions`, e);
      }
    }
  }

  return activeAddresses;
}
