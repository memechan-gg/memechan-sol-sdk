import { BN } from "@coral-xyz/anchor";
import { PublicKey, Keypair, Signer, Transaction } from "@solana/web3.js";
import { MemeTicket } from "../memeticket/MemeTicket";
import { MemechanClient } from "../MemechanClient";
import { Token } from "@raydium-io/raydium-sdk";
import { TokenMetadata } from "../token/types";

export interface SwapYArgs {
  payer: Signer;
  user: Keypair;
  pool: PublicKey;
  userSolAcc?: PublicKey;
  solAmountIn: BN;
  memeTokensOut: BN;
}

export type GetBuyMemeTransactionArgs = Omit<SwapYArgs, "user" | "payer" | "pool"> & {
  user: { publicKey: PublicKey };
  // inputToken: {
  //   mint: PublicKey;
  //   amount: string;
  // };
  // outputToken: {
  //   mint: PublicKey;
  //   minAmount: string;
  // };
  transaction?: Transaction;
};

export interface SwapXArgs {
  user: Keypair;
  pool: PublicKey;
  poolSignerPda: PublicKey;
  memeAmountIn: BN;
  solTokensOut: BN;
  userMemeTicket: MemeTicket;
  userSolAcc: PublicKey;
}

export type GetSellMemeTransactionArgs = Omit<SwapXArgs, "user" | "pool" | "poolSignerPda"> & {
  user: { publicKey: PublicKey };
  transaction?: Transaction;
};

export interface GoLiveArgs {
  pool: PublicKey;
  user: Keypair;
  payer: Signer;
  boundPoolInfo: object;
  memeVault: PublicKey;
  wSolVault: PublicKey;
  feeDestinationWalletAddress: string;
  quoteVault: PublicKey;
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
  tokenMetadata: TokenMetadata;
}

export interface InitStakingPoolResult {
  stakingMemeVault: PublicKey;
  stakingWSolVault: PublicKey;
}
