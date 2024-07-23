import BigNumber from "bignumber.js";
import { TransactionDataByDigest } from "./typeguards/txTypeguard";

export type TokenAccountRaw = {
  account: string;
  amount: string;
};

export type TokenAccountWithBNAmount = {
  account: string;
  amount: BigNumber;
};

export type ParsedTxData = {
  signature: string;
  timestamp: number;
  amountBN: BigNumber;
  user: string;
};

export type AggregatedTxData = {
  totalBN: BigNumber;
  user: string;
  transferData: {
    signature: string;
    timestamp: number;
    amountBN: BigNumber;
    user: string;
  }[];
};

export type AggregatedTxDataWithBonus = AggregatedTxData & {
  bonus: boolean;
  totalIncludingBonusBN: BigNumber;
};

export type UserAllocationsData = AggregatedTxDataWithBonus & {
  tokenAllocationIncludingBonus: BigNumber;
  tokenAllocationExcludingBonus: BigNumber;
};

export type FilteredOutTxsDataByReason = {
  failedTxs: TransactionDataByDigest[];
  noNativeTransfer: TransactionDataByDigest[];
  notCorrespondingToTargetAddress: TransactionDataByDigest[];
  beforeFromTimestamp: TransactionDataByDigest[];
  afterToTimestamp: TransactionDataByDigest[];
  notAllowedAddresses: TransactionDataByDigest[];
};

export type DASOption<T> = T | null;

export interface DASAssetProof {
  root: string;
  proof: Array<string>;
  node_index: number;
  leaf: string;
  tree_id: string;
}

export enum DASInterface {
  V1NFT = "V1_NFT",
  V1PRINT = "V1_PRINT",
  LEGACY_NFT = "LEGACY_NFT",
  Nft = "V2_NFT",
  FungibleAsset = "FungibleAsset",
  Custom = "Custom",
  Identity = "Identity",
  Executable = "Executable",
  ProgrammableNFT = "ProgrammableNFT",
}

export interface DASQuality {
  schema: string;
}

export enum DASContext {
  WalletDefault = "wallet-default",
  WebDesktop = "web-desktop",
  WebMobile = "web-mobile",
  AppMobile = "app-mobile",
  AppDesktop = "app-desktop",
  App = "app",
  Vr = "vr",
}

export interface DASFile {
  uri: DASOption<string>;
  cdn_uri: DASOption<string>;
  mime: DASOption<string>;
  quality: DASOption<DASQuality>;
  contexts: DASOption<DASContext[]>;
}

export type DASFiles = Array<DASFile>;

export type DASLinks = Record<string, any>;

export interface DASContent {
  schema: string;
  json_uri: string;
  files: DASOption<DASFiles>;
  metadata: DASMetadata;
  links: DASOption<DASLinks>;
}

export interface DASMetadata {
  attributes?: DASAttribute[];
  description: string;
  name: string;
  symbol: string;
}

interface DASAttribute {
  value: string;
  trait_type: string;
}

export enum DASScope {
  Full = "full",
  Royalty = "royalty",
  Metadata = "metadata",
  Extension = "extension",
}

export interface DASAuthority {
  address: string;
  scopes: Array<DASScope>;
}

export interface DASCompression {
  eligible: boolean;
  compressed: boolean;
  data_hash: string;
  creator_hash: string;
  asset_hash: string;
  tree: string;
  seq: number;
  leaf_id: number;
}

export interface DASGroup {
  group_key: string;
  group_value: string;
}

export enum DASRoyaltyModel {
  Creators = "creators",
  Fanout = "fanout",
  Single = "single",
}

export interface DASRoyalty {
  royalty_model: DASRoyaltyModel;
  target: DASOption<string>;
  percent: number;
  basis_points: number;
  primary_sale_happened: boolean;
  locked: boolean;
}

export interface DASCreator {
  address: string;
  share: number;
  verified: boolean;
}

export enum DASOwnershipModel {
  Single = "single",
  Token = "token",
}

export interface DASOwnership {
  frozen: boolean;
  delegated: boolean;
  delegate: DASOption<string>;
  ownership_model: DASOwnershipModel;
  owner: string;
}

export enum DASUseMethod {
  Burn = "Burn",
  Multiple = "Multiple",
  Single = "Single",
}

export interface DASUses {
  use_method: DASUseMethod;
  remaining: number;
  total: number;
}

export interface DASSupply {
  print_max_supply: number;
  print_current_supply: number;
  edition_nonce: DASOption<number>;
}

export interface DASAsset {
  interface: DASInterface;
  id: string;
  content: DASOption<DASContent>;
  authorities: DASOption<Array<DASAuthority>>;
  compression: DASOption<DASCompression>;
  grouping: DASOption<Array<DASGroup>>;
  royalty: DASOption<DASRoyalty>;
  creators: DASOption<Array<DASCreator>>;
  ownership: DASOwnership;
  uses: DASOption<DASUses>;
  supply: DASOption<DASSupply>;
  mutable: boolean;
  burnt: boolean;
}
