import { BN } from "@coral-xyz/anchor";
import { Token } from "@raydium-io/raydium-sdk";
import { Keypair, PublicKey, Signer, Transaction } from "@solana/web3.js";
import { MemechanClient } from "../MemechanClient";
import { MemeTicket } from "../memeticket/MemeTicket";
import { BoundPool } from "../schema/codegen/accounts";
import { TokenMetadata } from "../token/types";

export interface SwapYArgs {
  payer: Signer;
  user: Keypair;
  pool: PublicKey;
  userSolAcc?: PublicKey;
  quoteAmountIn: BN;
  quoteMint: PublicKey;
  memeTokensOut: BN;
}

export type GetBuyMemeTransactionArgs = {
  user: PublicKey;
  inputTokenAccount?: PublicKey;
  inputAmount: string;
  minOutputAmount: string;
  slippagePercentage: number;
  transaction?: Transaction;
};

export type GetSellMemeTransactionArgs = Omit<GetBuyMemeTransactionArgs, "inputTokenAccount"> & {
  outputTokenAccount?: PublicKey;
};

export type BuyMemeArgs = GetBuyMemeTransactionArgs & { signer: Keypair };

export type SellMemeArgs = GetSellMemeTransactionArgs & { signer: Keypair };

export type GetOutputAmountForBuyMemeArgs = Omit<BuyMemeArgs, "minOutputAmount">;

export type GetOutputAmountForSellMemeArgs = Omit<SellMemeArgs, "minOutputAmount">;

export type GetBuyMemeTransactionOutput = {
  tx: Transaction;
  memeTicketKeypair: Keypair;
  inputTokenAccount: PublicKey;
};

export type GetSellMemeTransactionOutput = {
  tx: Transaction;
};

export interface SwapXArgs {
  user: Keypair;
  //pool: PublicKey;
  //poolSignerPda: PublicKey;
  memeAmountIn: BN;
  minQuoteAmountOut: BN;
  userMemeTicket: MemeTicket;
  userQuoteAcc: PublicKey;
  quoteMint: PublicKey;
}

export interface GoLiveArgs {
  user: Keypair;
  payer: Signer;
  boundPoolInfo: BoundPool;
  memeVault: PublicKey;
  feeDestinationWalletAddress: string;
  quoteVault: PublicKey;
}

export type GetGoLiveTransactionArgs = GoLiveArgs & { transaction?: Transaction };

export interface InitStakingPoolArgs {
  pool?: PublicKey;
  user: Keypair;
  payer: Signer;
  boundPoolInfo: BoundPool;
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
