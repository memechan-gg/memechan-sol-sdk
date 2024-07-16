import { PublicKey } from "@solana/web3.js";
import { MemechanClient } from "../../MemechanClient";
import { MemechanClientV2 } from "../../MemechanClientV2";
import { MemeTicketClientV2 } from "../../memeticket/MemeTicketClientV2";
import { MemeTicketClient } from "../../memeticket/MemeTicketClient";
import { getConfig } from "../..";

export type MemeTicketClientVersioned =
  | { version: "V1"; memeTicketClient: MemeTicketClient }
  | { version: "V2"; memeTicketClient: MemeTicketClientV2 };

export async function getMemeTicketClientFromId(
  ticketId: PublicKey,
  client: MemechanClient,
  clientV2: MemechanClientV2,
): Promise<MemeTicketClientVersioned> {
  const accountInfo = await clientV2.connection.getAccountInfo(ticketId);

  if (!accountInfo) {
    throw new Error(`Account not found: ${ticketId.toString()}`);
  }

  console.log("accountInfo.owner:", accountInfo.owner);
  const config = await getConfig();

  if (accountInfo.owner.toBase58() == config.MEMECHAN_PROGRAM_ID_V2) {
    return { memeTicketClient: new MemeTicketClientV2(ticketId, clientV2), version: "V2" };
  }

  return { memeTicketClient: new MemeTicketClient(ticketId, client), version: "V1" };
}
