import { AnchorProvider, Program, Wallet, setProvider } from "@coral-xyz/anchor";
import { Connection, ConnectionConfig, Keypair, PublicKey } from "@solana/web3.js";
import { IDL, MemechanSol } from "./schema/types/memechan_sol";
import { MEMECHAN_PROGRAM_ID } from "./config/config";

export interface MemechanClientConfigArgs {
  wallet: Wallet;
  rpcConnectionConfig?: ConnectionConfig;
  rpcApiUrl: string;
  wssApiUrl: string;
  heliusApiUrl: string;
  isTest: boolean;
  simulationKeypair: Keypair;
}

export class MemechanClient {
  public wallet: Wallet;
  public connection: Connection;
  public memechanProgram: Program<MemechanSol>;
  public anchorProvider: AnchorProvider;
  public heliusApiUrl: string;
  public simulationKeypair: Keypair;

  constructor(private config: MemechanClientConfigArgs) {
    const { wallet, isTest, rpcApiUrl, rpcConnectionConfig, wssApiUrl, heliusApiUrl } = config;

    this.wallet = wallet;
    this.connection = new Connection(rpcApiUrl, {
      httpAgent: isTest ? false : undefined,
      commitment: "confirmed",
      wsEndpoint: wssApiUrl,
      confirmTransactionInitialTimeout: 120000,

      ...(rpcConnectionConfig ? rpcConnectionConfig : {}),
    });

    this.heliusApiUrl = heliusApiUrl;
    const provider = new AnchorProvider(this.connection, wallet, { commitment: "confirmed" });
    setProvider(provider);
    this.anchorProvider = provider;

    console.log("program id: " + MEMECHAN_PROGRAM_ID);
    console.log("connection rpc: " + this.connection.rpcEndpoint);

    this.memechanProgram = new Program<MemechanSol>(IDL, new PublicKey(MEMECHAN_PROGRAM_ID), provider);
    this.simulationKeypair = config.simulationKeypair;
  }
}
