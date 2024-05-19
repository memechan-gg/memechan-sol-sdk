import { Keypair, PublicKey } from "@solana/web3.js";
import { MemechanClient } from "../MemechanClient";

export type CreateTargetConfigArgs = {
  client: MemechanClient;
  payer: Keypair;
  mint: PublicKey;
}