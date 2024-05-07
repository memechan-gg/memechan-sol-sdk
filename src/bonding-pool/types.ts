import { BN } from "@coral-xyz/anchor";
import { PublicKey, Keypair, Signer } from "@solana/web3.js";
import { MemeTicket } from "../memeticket/MemeTicket";
import { SolanaContext } from "../common/types";

export interface SwapYArgs {
  user: Keypair;
  pool: PublicKey;
  poolSignerPda: PublicKey;
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
  poolSignerPda: PublicKey;
}

export interface BondingPoolArgs {
  admin: PublicKey;
  payer: Signer;
  signer: Keypair;
  solanaContext: SolanaContext;
}
