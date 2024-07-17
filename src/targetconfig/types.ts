import { Keypair, PublicKey } from "@solana/web3.js";
import { MemechanClient } from "../MemechanClient";
import BN from "bn.js";
import { MemechanClientV2 } from "../MemechanClientV2";

export type CreateTargetConfigArgs = {
  client: MemechanClient;
  payer: Keypair;
  mint: PublicKey;
  targetAmount: BN;
};

export type CreateTargetConfigArgsV2 = {
  client: MemechanClientV2;
  payer: Keypair;
  mint: PublicKey;
  targetAmount: BN;
};
