import { TldParser } from "@onsol/tldparser";
import { Connection, PublicKey } from "@solana/web3.js";

export async function resolveReferrer(connection: Connection, referrer: string): Promise<PublicKey | undefined> {
  // Check if the referrer is already a valid Solana address
  try {
    const refPubKey = new PublicKey(referrer);
    return refPubKey; // If it's a valid address, return it directly
  } catch (e) {
    // If it's not a valid address, attempt to resolve it as a domain
    console.log("Referrer is not a valid Solana address, attempting to resolve as domain");
  }

  return await resolveDomain(connection, referrer);
}

async function resolveDomain(connection: Connection, domain: string) {
  // initialize a Tld Parser
  const parser = new TldParser(connection);

  return await parser.getOwnerFromDomainTld(domain);
}
