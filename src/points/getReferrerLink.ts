import { MainDomain, findMainDomain } from "@onsol/tldparser";
import { PublicKey, Connection } from "@solana/web3.js";

export async function getReferrerLink(connection: Connection, walletAddress: string, origin?: string): Promise<string> {
  const baseUrl =
    origin || (typeof window !== "undefined" && window.location)
      ? window.location.origin
      : "https://solana.memechan.gg";

  const walletPubKey = new PublicKey(walletAddress);
  const [mainDomainPubkey] = findMainDomain(walletPubKey);
  let mainDomain = undefined;
  try {
    mainDomain = await MainDomain.fromAccountAddress(connection, mainDomainPubkey);
  } catch (e) {
    console.log("No main domain found");
  }
  const referrer = mainDomain?.domain || walletAddress;
  return `${baseUrl}/?referrer=${referrer}`;
}
