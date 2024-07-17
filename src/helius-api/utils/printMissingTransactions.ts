import { TransactionDataByDigest } from "../typeguards/txTypeguard";

export function printMissingTransactions(
  signatureChunk: string[],
  parsedSignaturesData: TransactionDataByDigest[],
): void {
  // Create a set of parsed signatures for quick lookup
  const parsedSignaturesSet = new Set(parsedSignaturesData.map((tx) => tx.signature.trim()));

  // Filter out the signatures that are in signatureChunk but not in parsedSignaturesSet
  const missingSignatures = signatureChunk.filter((signature) => !parsedSignaturesSet.has(signature.trim()));

  console.debug("Checking for transactions in signatureChunk that are not in parsedSignaturesData:");

  if (missingSignatures.length > 0) {
    console.debug("Transactions missing in parsedSignaturesData:");
    missingSignatures.forEach((signature) => console.debug(signature));
  } else {
    console.debug("All transactions in signatureChunk are present in parsedSignaturesData.");
  }
}
