import { BN } from "@coral-xyz/anchor";
import { Token } from "@raydium-io/raydium-sdk";
import { Connection, Keypair, PublicKey, Signer, Transaction } from "@solana/web3.js";
import { MemechanClient } from "../MemechanClient";
import { MemeTicketClient } from "../memeticket/MemeTicketClient";
import { BoundPool } from "../schema/codegen/accounts";
import { BoundPool as BoundPoolV2 } from "../schema/v2/codegen/accounts";
import { OffchainMetadata } from "../api/types";
import { MemechanClientV2 } from "../MemechanClientV2";
import { TokenInfo } from "../config/types";

export interface SwapYArgs {
  payer: Signer;
  user: Keypair;
  pool: PublicKey;
  userSolAcc?: PublicKey;
  quoteAmountIn: BN;
  quoteMint: PublicKey;
  memeTokensOut: BN;
  memeTicketNumber: number;
}

export type GetBuyMemeTransactionArgs = {
  user: PublicKey;
  inputTokenAccount?: PublicKey;
  inputAmount: string;
  minOutputAmount: string;
  slippagePercentage: number;
  transaction?: Transaction;
  memeTicketNumber: number;
  referrer?: PublicKey;
};

export type BuyMemeArgs = GetBuyMemeTransactionArgs & { signer: Keypair };

export type GetOutputAmountForBuyMeme = Omit<
  BuyMemeArgs,
  "minOutputAmount" | "inputTokenAccount" | "user" | "signer" | "memeTicketNumber"
>;

export type GetBuyMemeTransactionOutput = {
  tx: Transaction;
  memeTicketPublicKey: PublicKey;
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

export type GoLiveStaticArgs = Omit<GoLiveArgs, "boundPoolInfo"> & {
  memeMint: PublicKey;
  client: MemechanClient;
  quoteMint: PublicKey;
};

export type GetInitQuoteAmmPoolTransactionArgs = InitQuoteAmmPoolTransactionArgs & { transaction?: Transaction };

export type GetInitQuoteAmmPoolTransactionStaticArgs = GetInitQuoteAmmPoolTransactionArgs & {
  transaction?: Transaction;
};

export interface InitQuoteAmmPoolTransactionArgs {
  client: MemechanClientV2;
  user: Keypair;
  payer: Signer;
  memeVault: PublicKey;
  quoteVault: PublicKey;
  tokenInfoA: TokenInfo; // memeMint
  tokenInfoB: TokenInfo;
  transferCreatorBonusArgs: TransferCreatorBonusChanFundsArgs;
}

export type InitChanAmmPool = Omit<InitQuoteAmmPoolTransactionArgs, "transferCreatorBonusArgs"> & {
  chanSwap: PublicKey;
};

export type GetGoLiveTransactionArgs = GoLiveArgs & {
  transaction?: Transaction;
};

export type GetGoLiveTransactionStaticArgs = GoLiveStaticArgs & { transaction?: Transaction };

export type GetInitChanPoolTransactionArgs = InitChanAmmPool & {
  transaction?: Transaction;
};

export type GetInitChanAmmPoolTransactionStaticArgs = GetInitChanPoolTransactionArgs & {
  transaction?: Transaction;
};

export interface InitStakingPoolArgs {
  pool?: PublicKey;
  user: Keypair;
  payer: Signer;
  boundPoolInfo: BoundPool;
}

export interface InitStakingPoolArgsV2 {
  pool?: PublicKey;
  user: Keypair;
  payer: Signer;
  boundPoolInfo: BoundPoolV2;
}

export type GetInitStakingPoolTransactionArgs = Omit<InitStakingPoolArgs, "user"> & {
  user: PublicKey;
  transaction?: Transaction;
};

export type GetInitStakingPoolTransactionArgsV2 = Omit<InitStakingPoolArgsV2, "user"> & {
  user: PublicKey;
  transaction?: Transaction;
};

export interface BoundPoolArgs {
  admin: PublicKey;
  payer: Signer;
  client: MemechanClient;
  quoteToken: Token;
  tokenMetadata: OffchainMetadata;
}

export type BoundPoolArgsV2 = Omit<BoundPoolArgs, "client"> & {
  client: MemechanClientV2;
  topHolderFeeBps: number;
};

export interface BoundPoolWithBuyMemeArgs {
  admin: PublicKey;
  payer: Signer;
  client: MemechanClient;
  quoteToken: Token;
  tokenMetadata: OffchainMetadata;
  buyMemeTransactionArgs: GetBuyMemeTransactionArgs;
  targetConfig: PublicKey;
}

export type BoundPoolWithBuyMemeArgsV2 = Omit<BoundPoolWithBuyMemeArgs, "client"> & {
  client: MemechanClientV2;
  topHolderFeeBps: number;
};

export type GetCreateNewBondingPoolAndTokenTransactionArgs = Omit<BoundPoolArgs, "payer"> & {
  payer: PublicKey;
  transaction?: Transaction;
  feeQuoteVaultPk?: PublicKey;
};

export type GetCreateNewBondingPoolAndTokenTransactionArgsV2 = Omit<BoundPoolArgsV2, "payer"> & {
  payer: PublicKey;
  transaction?: Transaction;
  feeQuoteVaultPk?: PublicKey;
};

export type GetBuyMemeTransactionStaticArgs = GetBuyMemeTransactionArgs & {
  boundPoolId: PublicKey;
  poolSignerPda: PublicKey;
  client: MemechanClient;
  quoteVault: PublicKey;
  quoteMint: PublicKey;
};

export type GetBuyMemeTransactionStaticArgsV2 = Omit<GetBuyMemeTransactionStaticArgs, "client"> & {
  client: MemechanClientV2;
};

export type GetCreateNewBondingPoolAndTokenWithBuyMemeTransactionArgs =
  GetCreateNewBondingPoolAndTokenTransactionArgs & {
    buyMemeTransactionArgs?: GetBuyMemeTransactionArgs;
  };

export type GetCreateNewBondingPoolAndTokenWithBuyMemeTransactionArgsV2 =
  GetCreateNewBondingPoolAndTokenTransactionArgsV2 & {
    buyMemeTransactionArgs?: GetBuyMemeTransactionArgs;
    memeMintKeypair?: Keypair;
  };

export interface InitStakingPoolResult {
  stakingMemeVault: PublicKey;
  stakingQuoteVault: PublicKey;
}

export interface InitStakingPoolResultV2 {
  stakingMemeVault: PublicKey;
  stakingQuoteVault: PublicKey;
  stakingChanVault: PublicKey;
}

export interface TransferCreatorBonusChanFundsArgs {
  creator: PublicKey;
  payer: Keypair;
  connection: Connection;
  amount: bigint;
  transaction?: Transaction;
}
