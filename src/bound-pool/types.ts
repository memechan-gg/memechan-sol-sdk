import { BN } from "@coral-xyz/anchor";
import { PublicKey, Keypair, Signer, Transaction } from "@solana/web3.js";
import { MemeTicket } from "../memeticket/MemeTicket";
import { MemechanClient } from "../MemechanClient";
import { Token } from "@raydium-io/raydium-sdk";
import { TokenMetadata } from "../token/types";
import { BoundPool as CodegenBoundPool } from "../schema/codegen/accounts";

export interface SwapYArgs {
  payer: Signer;
  user: Keypair;
  pool: PublicKey;
  userSolAcc?: PublicKey;
  quoteAmountIn: BN;
  quoteMint: PublicKey;
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
  user: Keypair;
  payer: Signer;
  boundPoolInfo: CodegenBoundPool;
  memeVault: PublicKey;
  feeDestinationWalletAddress: string;
  quoteVault: PublicKey;
}

export interface InitStakingPoolArgs {
  pool?: PublicKey;
  user: Keypair;
  payer: Signer;
  // TODO: Add type for `boundPoolInfo`
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  boundPoolInfo: any;
}

export type GetInitStakingPoolTransactionArgs = InitStakingPoolArgs & { transaction?: Transaction };

export interface BoundPoolArgs {
  admin: PublicKey;
  payer: Signer;
  signer: Keypair;
  client: MemechanClient;
  quoteToken: Token;
  tokenMetadata: TokenMetadata;
}

export type GetCreateNewBondingPoolAndTokenTransactionArgs = BoundPoolArgs & {
  transaction?: Transaction;
  adminSolPublicKey?: PublicKey;
};

export interface InitStakingPoolResult {
  stakingMemeVault: PublicKey;
  stakingQuoteVault: PublicKey;
}
