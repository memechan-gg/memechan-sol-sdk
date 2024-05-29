import { BN } from "@coral-xyz/anchor";
import { Token } from "@raydium-io/raydium-sdk";
import { Keypair, PublicKey, Signer, Transaction } from "@solana/web3.js";
import { MemechanClient } from "../MemechanClient";
import { MemeTicketClient } from "../memeticket/MemeTicketClient";
import { BoundPool } from "../schema/codegen/accounts";
import { TokenMetadata } from "../api/types";

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

export type BuyMemeArgs = GetBuyMemeTransactionArgs & { signer: Keypair };

export type GetOutputAmountForBuyMeme = Omit<BuyMemeArgs, "minOutputAmount" | "inputTokenAccount" | "user" | "signer">;

export type GetBuyMemeTransactionOutput = {
  tx: Transaction;
  memeTicketKeypair: Keypair;
  inputTokenAccount: PublicKey;
};

export type GetSellMemeTransactionArgs = {
  user: PublicKey;
  outputTokenAccount?: PublicKey;
  inputAmount: string;
  minOutputAmount: string;
  slippagePercentage: number;
  transaction?: Transaction;
};

export type SellMemeArgs = GetSellMemeTransactionArgs & { signer: Keypair };

export type GetOutputAmountForSellMemeArgs = Omit<
  SellMemeArgs,
  "minOutputAmount" | "inputTokenAccount" | "user" | "signer"
>;

export type GetSellMemeTransactionOutput = {
  txs: Transaction[];
  isMoreThanOneTransaction: boolean;
};

export interface SwapXArgs {
  user: Keypair;
  // pool: PublicKey;
  // poolSignerPda: PublicKey;
  memeAmountIn: BN;
  minQuoteAmountOut: BN;
  userMemeTicket: MemeTicketClient;
  userQuoteAcc: PublicKey;
  quoteMint: PublicKey;
}

export type GetSellMemeTransactionArgsLegacy = Omit<SwapXArgs, "user" | "pool" | "poolSignerPda"> & {
  user: { publicKey: PublicKey };
  transaction?: Transaction;
};

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

export type GetInitStakingPoolTransactionArgs = Omit<InitStakingPoolArgs, "user"> & {
  user: PublicKey;
  transaction?: Transaction;
};

export interface BoundPoolArgs {
  admin: PublicKey;
  payer: Signer;
  client: MemechanClient;
  quoteToken: Token;
  tokenMetadata: TokenMetadata;
}

export interface BoundPoolWithBuyMemeArgs {
  admin: PublicKey;
  payer: Signer;
  client: MemechanClient;
  quoteToken: Token;
  tokenMetadata: TokenMetadata;
  buyMemeTransactionArgs: GetBuyMemeTransactionArgs;
}

export type GetCreateNewBondingPoolAndTokenTransactionArgs = Omit<BoundPoolArgs, "payer"> & {
  payer: PublicKey;
  transaction?: Transaction;
  adminSolPublicKey?: PublicKey;
};

export type GetBuyMemeTransactionStaticArgs = GetBuyMemeTransactionArgs & {
  boundPoolId: PublicKey;
  poolSignerPda: PublicKey;
  client: MemechanClient;
  quoteVault: PublicKey;
};

export type GetCreateNewBondingPoolAndTokenWithBuyMemeTransactionArgs =
  GetCreateNewBondingPoolAndTokenTransactionArgs & {
    buyMemeTransactionArgs?: GetBuyMemeTransactionArgs;
  };

export interface InitStakingPoolResult {
  stakingMemeVault: PublicKey;
  stakingQuoteVault: PublicKey;
}
