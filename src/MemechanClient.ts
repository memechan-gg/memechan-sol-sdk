import { AnchorProvider, Program, Wallet, setProvider } from "@coral-xyz/anchor";
import { Connection, PublicKey } from "@solana/web3.js";
import { IDL, MemechanSol } from "./schema/types/memechan_sol";

export class MemechanClient {
  public connection: Connection;
  public memechanProgram: Program<MemechanSol>;

  constructor(
    private wallet: Wallet,
    //network: Cluster = process.env.NETWORK as Cluster,
  ) {
    this.wallet = wallet;
    const isTest = process.env.NODE_ENV === "test";

    //this.connection = new Connection(clusterApiUrl('devnet'), {
    this.connection = new Connection(process.env.RPC_API_CLUSTER, {
      httpAgent: isTest ? false : undefined,
      commitment: "confirmed",
      wsEndpoint: process.env.WSS_API_CLUSTER,
      confirmTransactionInitialTimeout: 120000
    });

    const provider = new AnchorProvider(this.connection, wallet, { commitment: "confirmed" });
    setProvider(provider);

    console.log("program id: " + process.env.MEMECHAN_PROGRAM_ID);
    console.log("connection rpc: " + this.connection.rpcEndpoint);
    this.memechanProgram = new Program<MemechanSol>(IDL, new PublicKey(process.env.MEMECHAN_PROGRAM_ID!), provider);
  }
}
