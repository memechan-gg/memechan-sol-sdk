import { PublicKey } from "@solana/web3.js";
import BN from "bn.js";
import { TokenInfo } from "./types";

export interface SdkConfig {
  BE_URL: string;
  API_GATEWAY_FQDN: string;
  FEE_DESTINATION_ID: string;
  ADMIN_PUB_KEY: PublicKey;
  MEMECHAN_PROGRAM_ID_PK: PublicKey;
  BE_REGION: string;
  BE_URL_DEV: string;
  BOUND_POOL_FEE_WALLET: string;
  BOUND_POOL_VESTING_PERIOD: BN;
  LP_FEE_WALLET: string;
  TH_FEE_WALLET: string;
  MEMECHAN_FEE_WALLET_ID: string;
  MEMECHAN_PROGRAM_ID: string;
  MEMECHAN_PROGRAM_ID_V2: string;
  MEMECHAN_PROGRAM_ID_V2_PK: PublicKey;
  PATS_MINT: PublicKey;
  SWAP_FEE_WALLET: string;
  TOKEN_INFOS: { [symbol: string]: TokenInfo };
  MERCURIAL_AMM_PROGRAM_ID: string;
  POINTS_MINT: PublicKey;
  VESTING_PROGRAM_ID: PublicKey;
}
