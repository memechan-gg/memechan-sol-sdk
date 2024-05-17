import { BN } from "@coral-xyz/anchor";
import { PublicKey, Keypair, Signer } from "@solana/web3.js";
import { MemeTicket } from "../memeticket/MemeTicket";
import { MemechanClient } from "../MemechanClient";
import { Token } from "@raydium-io/raydium-sdk";

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
  boundPoolInfo: object;
  memeVault: PublicKey;
  wSolVault: PublicKey;
}

export interface InitStakingPoolArgs {
  pool: PublicKey;
  user: Keypair;
  payer: Signer;
  boundPoolInfo: object;
}

export interface BoundPoolArgs {
  admin: PublicKey;
  payer: Signer;
  signer: Keypair;
  client: MemechanClient;
  quoteToken: Token;
}

export interface InitStakingPoolResult {
  stakingMemeVault: PublicKey;
  stakingWSolVault: PublicKey;
}