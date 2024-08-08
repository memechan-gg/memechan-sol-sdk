import { PublicKey } from "@solana/web3.js";
import { TokenInfo } from "./types";
import BN from "bn.js";
import { SdkConfig } from "./sdkConfig";
import { NATIVE_MINT, TOKEN_PROGRAM_ID } from "./consts";

const MERCURIAL_AMM_PROGRAM_ID = "Eo7WjKq67rjJQSZxS6z3YkapzY3eMj6Xy8X5EQVn5UaB";

const BE_URL_DEV = "https://dmgrnigolfno6.cloudfront.net";

/**
 * The base URL for the backend API for fetching off-chain data.
 *
 * @constant {string}
 */
const BE_URL = BE_URL_DEV;

const BE_REGION = "us-east-1";
const API_GATEWAY_FQDN = "waqxcrbt93.execute-api.us-east-1.amazonaws.com"; // dev

/**
 * The Memechan program ID on Solana.
 * This is the entry point of the Memechan smart contract.
 *
 * Be aware, that the same program address should be specified in IDL (`src/idl/memechan_sol.json`)
 *
 * @constant {string}
 */
const MEMECHAN_PROGRAM_ID = "cYsHcSU42XESLPquuN1ga94jm1wVMg11wVcxqvofA3k";
const MEMECHAN_PROGRAM_ID_PK = new PublicKey(MEMECHAN_PROGRAM_ID);

/**
 * The Memechan program ID on Solana.
 * This is the entry point of the Memechan smart contract.
 *
 * Be aware, that the same program address should be specified in IDL (`src/idl/memechan_sol.json`)
 *
 * @constant {string}
 */
const MEMECHAN_PROGRAM_ID_V2 = "CaR9ciDnNnE6WX35tZWrjeGdKUPaft7r4oQGF4JhwVxZ";
const MEMECHAN_PROGRAM_ID_V2_PK = new PublicKey(MEMECHAN_PROGRAM_ID_V2);

/**
 * The Memechan fee wallet id.
 * This address collects fee from memechan protocol
 *
 * @constant {string}
 */
const MEMECHAN_FEE_WALLET_ID = "feeLPZEfzJFwDR11cdMWE3nSa4nr7sPPM4u6tmDTw3Y";

const BOUND_POOL_FEE_WALLET = "6YNJG9KDex3eNAmh1i64KUDbfKBiESkew3AWmnf6FiCy";
const LP_FEE_WALLET = "HQ1wVLaBcnuoUozegyX7r45yn6ogHvQjdPNj53iweC5V";
const SWAP_FEE_WALLET = "xqzvZzKFCjvPuRqkyg5rxA95avrvJxesZ41rCLfYwUM";

const FEE_DESTINATION_ID = "7YttLkHDoNj9wyDur5pM1ejNaAvT9X4eqaYcHQqtj2G5";

// https://explorer.solana.com/address/35fN6LMYt6cKsemgbR28nFooiJtcnvaKPCeRXyuMKfoF
const PATS_MINT = new PublicKey("35fN6LMYt6cKsemgbR28nFooiJtcnvaKPCeRXyuMKfoF");

const BOUND_POOL_VESTING_PERIOD = new BN(600);

const TOKEN_INFOS: { [symbol: string]: TokenInfo } = {
  WSOL: new TokenInfo({
    programId: TOKEN_PROGRAM_ID,
    mint: NATIVE_MINT,
    decimals: 9,
    name: "SOL",
    symbol: "SOL",
    memeChanProgramId: MEMECHAN_PROGRAM_ID_PK,
    memeChanProgramIdV2: MEMECHAN_PROGRAM_ID_V2_PK,
  }),
  SLERF: new TokenInfo({
    programId: TOKEN_PROGRAM_ID,
    mint: new PublicKey("7BgBvyjrZX1YKz4oh9mjb8ZScatkkwb8DzFx7LoiVkM3"),
    decimals: 9,
    name: "SLERF",
    symbol: "SLERF",
    memeChanProgramId: MEMECHAN_PROGRAM_ID_PK,
    memeChanProgramIdV2: MEMECHAN_PROGRAM_ID_V2_PK,
  }),
  CHAN: new TokenInfo({
    programId: TOKEN_PROGRAM_ID,
    mint: new PublicKey("9pECN2xxLQo22bFYpsNr3T3eW1UdEDtSqPQopFrGv7n4"),
    decimals: 9,
    symbol: "CHAN",
    name: "memechan",
    memeChanProgramId: MEMECHAN_PROGRAM_ID_PK,
    memeChanProgramIdV2: MEMECHAN_PROGRAM_ID_V2_PK,
  }),
};

// Backend Wallet Address
const ADMIN_PUB_KEY = new PublicKey("5dsHxqEueQ6nvDopUUKihvQtpm7LWcbw2wCSPtRyAEb1");

const config: SdkConfig = {
  BE_URL_DEV,
  BE_URL,
  BE_REGION,
  API_GATEWAY_FQDN,
  MEMECHAN_PROGRAM_ID,
  MEMECHAN_PROGRAM_ID_PK,
  MEMECHAN_PROGRAM_ID_V2,
  MEMECHAN_PROGRAM_ID_V2_PK,
  MEMECHAN_FEE_WALLET_ID,
  BOUND_POOL_FEE_WALLET,
  LP_FEE_WALLET,
  SWAP_FEE_WALLET,
  FEE_DESTINATION_ID,
  PATS_MINT,
  BOUND_POOL_VESTING_PERIOD,
  TOKEN_INFOS,
  ADMIN_PUB_KEY,
  MERCURIAL_AMM_PROGRAM_ID,
};

export default config;
