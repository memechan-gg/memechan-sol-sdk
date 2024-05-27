import { PublicKey } from "@solana/web3.js";
import { client, connection } from "../common";
import bs58 from "bs58";
import nacl from "tweetnacl";

// Calculate the discriminator for the BoundPool account
async function getDiscriminator(accountName: string) {
  const hash = nacl.hash(new TextEncoder().encode(`account:${accountName}`));
  return hash.slice(0, 8);
}

// yarn tsx examples/bonding-pool/fetch-all-locked.ts > fetch-all-locked-bonding-pool.txt 2>&1
export async function fetchLockedAccounts() {
  const programId = client.memechanProgram.programId.toString();
  const discriminator = await getDiscriminator('BoundPool');

  console.log("discriminator:", bs58.encode(discriminator));

  const offset = 72 + 72 + 8 + 8 + 32 + 32 + 16 + 104;

  const filters = [
  {
    memcmp: {
      offset: 0,
      bytes: bs58.encode(discriminator),
    },
  },
  {
    memcmp: {
      offset: offset,
      bytes: '1',
    },
  },
  ];

  const accounts = await connection.getProgramAccounts(new PublicKey(programId), {
    filters: filters,
  });

  console.log("locked accounts:", accounts);

  return accounts;
}

fetchLockedAccounts();
