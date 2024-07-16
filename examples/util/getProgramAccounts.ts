import { connection, createMemeChanClient } from "../common";

// yarn tsx examples/util/getProgramAccounts.ts > getProgramAccounts.txt 2>&1
export async function getProgramAccounts() {
  const client = await createMemeChanClient();

  const programAccounts = await connection.getProgramAccounts(client.memechanProgram.programId);
  console.log("programAccounts.length:", programAccounts.length);
}

getProgramAccounts();
