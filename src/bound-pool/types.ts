import { BN } from "@coral-xyz/anchor";
import { PublicKey, Keypair, Signer } from "@solana/web3.js";
import { MemeTicket } from "../memeticket/MemeTicket";
import { MemechanClient } from "../MemechanClient";

export interface SwapYArgs {
  payer: Signer;
  user: Keypair;
  pool: PublicKey;
  userSolAcc: PublicKey;
  solAmountIn: BN;
  memeTokensOut: BN;
}

export interface SwapXArgs {
  user: Keypair;
  pool: PublicKey;
  poolSignerPda: PublicKey;
  memeAmountIn: BN;
  solTokensOut: BN;
  userMemeTicket: MemeTicket;
  userSolAcc: PublicKey;
}

export interface GoLiveArgs {
  pool: PublicKey;
  user: Keypair;
  payer: Signer;
}

export interface InitStakingPoolArgs {
  pool: PublicKey;
  user: Keypair;
  payer: Signer;
}

export interface BoundPoolArgs {
  admin: PublicKey;
  payer: Signer;
  signer: Keypair;
  client: MemechanClient;
}
