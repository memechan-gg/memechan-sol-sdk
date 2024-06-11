import { Connection, PublicKey, SignaturesForAddressOptions } from "@solana/web3.js";

export const getSignatures = async function* ({
  job,
  publicKey,
  untilTransactionSignature = undefined,
  connection,
  limit,
}: {
  job: string;
  publicKey: PublicKey;
  untilTransactionSignature?: string;
  connection: Connection;
  limit?: number;
}) {
  const poolAddress = publicKey.toString();

  // Solana RPC searches from latest transaction until the first one. The limit is 1000 and we should request again
  // in case we need more. Docs:
  // https://solana-labs.github.io/solana-web3.js/modules.html#confirmedsignaturesforaddress2options
  const confirmedSignaturesInfo = [];
  let options: SignaturesForAddressOptions = untilTransactionSignature
    ? { until: untilTransactionSignature.trim(), limit: limit || 500 }
    : { limit: limit || 500 };
  while (true) {
    let confirmedSignaturesInfoFetched;
    try {
      confirmedSignaturesInfoFetched = await connection.getSignaturesForAddress(publicKey, options, "confirmed");
    } catch (e) {
      console.error(
        job,
        "ERROR getConfirmedTransactionsForPool: pool",
        poolAddress,
        ", options",
        options,
        ", error",
        e,
      );
      continue;
    }
    yield [...confirmedSignaturesInfoFetched].map((ps) => ps.signature);
    if (confirmedSignaturesInfoFetched.length < 500) {
      console.log(`${job} less than 500 transactions loaded for pool: ${poolAddress}`);
    }
    // we can't check for 0 due to bug with infinite loop in getSignaturesForAddress
    if (confirmedSignaturesInfoFetched.length < 100) {
      console.log(`${job} returned less than 100 signatures for pool: ${poolAddress}`);
      break;
    }
    options = {
      ...options,
      before: confirmedSignaturesInfoFetched[confirmedSignaturesInfoFetched.length - 1].signature,
    };
  }
};
