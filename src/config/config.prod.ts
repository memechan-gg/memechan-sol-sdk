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
const BE_URL = "https://api.memechan.gg";

const BE_REGION = "us-east-1";

const API_GATEWAY_FQDN = "h9crl8krnj.execute-api.us-east-1.amazonaws.com";

/**
 * The Memechan program ID on Solana.
 * This is the entry point of the Memechan smart contract.
 *
 * Be aware, that the same program address should be specified in IDL (`src/idl/memechan_sol.json`)
 *
 * @constant {string}
 */
const MEMECHAN_PROGRAM_ID = "memeVtsr1AqAjfRzW2PuzymQdP2m7SgL6FQ1xgMc9MR";

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
const PATS_MINT = new PublicKey("35fN6LMYt6cKsemgbR28nFooiJtcnvaKPCeRXyuMKfoF");

const BOUND_POOL_VESTING_PERIOD = new BN(259200);
const POINTS_MINT = new PublicKey("ptsVM2dwpBVhu6uR3D1zzoRSjm1TC8gdmBEk8jpTP1P");

const VESTING_PROGRAM_ID = new PublicKey("vestJGg7ZMQoXiAr2pLV5cqgtxFhEWzNoZL5Ngzb8H4");

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
    mint: new PublicKey("ChanGGuDHboPswpTmKDfsTVGQL96VHhmvpwrE4UjWssd"),
    decimals: 9,
    symbol: "CHAN",
    name: "memechan",
    memeChanProgramId: MEMECHAN_PROGRAM_ID_PK,
    memeChanProgramIdV2: MEMECHAN_PROGRAM_ID_V2_PK,
  }),
  POINT: new TokenInfo({
    programId: TOKEN_PROGRAM_ID,
    mint: POINTS_MINT,
    decimals: 9,
    symbol: "POINT",
    name: "point",
    memeChanProgramId: MEMECHAN_PROGRAM_ID_PK,
    memeChanProgramIdV2: MEMECHAN_PROGRAM_ID_V2_PK,
  }),
  vCHAN: new TokenInfo({
    programId: TOKEN_PROGRAM_ID,
    mint: new PublicKey("vCHANTQ8fiK13PvYABK9HbjbAJuzwiUsBC6VFfhKZT7"),
    decimals: 9,
    symbol: "vCHAN",
    name: "vCHAN",
    memeChanProgramId: MEMECHAN_PROGRAM_ID_PK,
    memeChanProgramIdV2: MEMECHAN_PROGRAM_ID_V2_PK,
  }),
  veCHAN: new TokenInfo({
    programId: TOKEN_PROGRAM_ID,
    mint: new PublicKey("VEchantZvFUiEimQtJhRExGhyWNwUMUH6wC88sN4mGj"),
    decimals: 9,
    symbol: "veCHAN",
    name: "veCHAN",
    memeChanProgramId: MEMECHAN_PROGRAM_ID_PK,
    memeChanProgramIdV2: MEMECHAN_PROGRAM_ID_V2_PK,
  }),
};

// Backend Wallet Address
const ADMIN_PUB_KEY = new PublicKey("adminWSnuCc7iLSnrxeGyEQX535nMuuiGf6PNnUx1nR");

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
  POINTS_MINT,
  VESTING_PROGRAM_ID,
};

export default config;
