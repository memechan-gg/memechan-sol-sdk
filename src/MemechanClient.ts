import { AnchorProvider, Program, Wallet, setProvider } from "@coral-xyz/anchor";
import { Connection, ConnectionConfig, PublicKey } from "@solana/web3.js";
import { IDL, MemechanSol } from "./schema/types/memechan_sol";

export class MemechanClient {
  public connection: Connection;
  public memechanProgram: Program<MemechanSol>;
  public anchorProvider: AnchorProvider;

  constructor(
    private wallet: Wallet,

    private rpcConnectionConfig: ConnectionConfig,
    private rpcApiUrl: string,
    private wssApiUrl: string,

    private memechanProgramId: string,
    private isTest: boolean,
  ) {
    this.wallet = wallet;
    this.connection = new Connection(rpcApiUrl, {
      httpAgent: isTest ? false : undefined,
      commitment: "confirmed",
      wsEndpoint: wssApiUrl,
      confirmTransactionInitialTimeout: 120000,

      ...(rpcConnectionConfig ? rpcConnectionConfig : {}),
    });

    const provider = new AnchorProvider(this.connection, wallet, { commitment: "confirmed" });
    setProvider(provider);
    this.anchorProvider = provider;

    console.log("program id: " + memechanProgramId);
    console.log("connection rpc: " + this.connection.rpcEndpoint);

    this.memechanProgram = new Program<MemechanSol>(IDL, new PublicKey(memechanProgramId), provider);
  }
}
