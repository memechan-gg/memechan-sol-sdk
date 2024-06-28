/* eslint-disable @typescript-eslint/no-unsafe-declaration-merging */
/* eslint-disable @typescript-eslint/no-explicit-any */
declare module "@raydium-io/raydium-sdk" {
  export const METADATA_PROGRAM_ID;
  export const MEMO_PROGRAM_ID;
  export const ENDPOINT;
  export const MAINNET_PROGRAM_ID;
  export const TxVersion: any;
  export const LOOKUP_TABLE_CACHE: any;
  export const LIQUIDITY_STATE_LAYOUT_V4: any;
  export const MARKET_STATE_LAYOUT_V3: any;
  export const SPL_MINT_LAYOUT: any;
  export class Market {
    static getAssociatedAuthority: any;
  }
  export class Token {
    public mint: any;
    public decimals: any;
    public name: any;
    public symbol: any;

    constructor(id: any, e: any, e2: any, e3?: any, e4?: any);
  }
  export class TokenAmount {
    constructor(id: any, e: any, e2?: boolean);
    public toExact: any;
  }
  export class Percent {
    constructor(id: any, e: any);
  }
  export class Liquidity {
    constructor(id: any, e: any);
    static computeAmountOut(e: any): any;
    static makeSwapInstructionSimple: any;
    static getAssociatedPoolKeys: any;
    static makeCreatePoolV4InstructionV2Simple: any;
    static getAssociatedAuthority: any;
    static fetchInfo: any;
  }
  export class ApiPoolInfoV4 {
    public id: any;
    public quoteMint: any;
    public baseMint: any;
    public lpMint: any;
    public baseDecimals: any;
    public quoteDecimals: any;
    public lpDecimals: any;
    public version: any;
    public programId: any;
    public authority: any;
    public openOrders: any;
    public targetOrders: any;
    public baseVault: any;
    public quoteVault: any;
    public withdrawQueue: any;
    public lpVault: any;
    public marketVersion: any;
    public marketProgramId: any;
    public marketId: any;
    public marketAuthority: any;
    public marketBaseVault: any;
    public marketQuoteVault: any;
    public marketBids: any;
    public marketAsks: any;
    public marketEventQueue: any;
    public lookupTableAccount: any;

    constructor(id: any, e: any);
  }
  export function jsonInfo2PoolKeys<T extends BasePoolInfo>(poolInfo: T): ReturnType;

  export const TOKEN_PROGRAM_ID: any;

  export class TokenAccount {
    public accountInfo: any;
  }
  export class CurrencyAmount {
    public toExact: any;
  }

  export const struct: any;
  export const blob: any;
  export const publicKey: any;
  export const u64: any;
  export const u8: any;
  export const u32: any;
  export const u16: any;
  export const splitTxAndSigners: any;
  export const generatePubKey: any;
  export const ZERO: any;
  export interface TxVersion {}
  export class WideBits {
    constructor(e: any);
    public addBoolean: any;
  }
  export class Base {}
  export class CacheLTA {}
  export class InstructionType {
    static setComputeUnitPrice: any;
    static createAccount: any;
    static initMarket: any;
    static initAccount: any;
  }

  export class LiquidityPoolKeys {
    public baseMint: any;
    public quoteMint: any;
  }

  export const buildSimpleTransaction: any;
  export const SPL_ACCOUNT_LAYOUT: any;
  export const ASSOCIATED_TOKEN_PROGRAM_ID: any;
  export interface InnerSimpleV0Transaction {}
}
