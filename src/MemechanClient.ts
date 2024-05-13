import { AnchorProvider, Program, Wallet, setProvider } from "@coral-xyz/anchor";
import { Cluster, Connection, PublicKey, clusterApiUrl } from "@solana/web3.js";
import { IDL, MemechanSol } from "./schema/types/memechan_sol";

export class MemechanClient {
  public connection: Connection;
  public memechanProgram: Program<MemechanSol>;

  constructor(
    private wallet: Wallet,
    network: Cluster = process.env.NETWORK as Cluster,
  ) {
    this.wallet = wallet;
    const isTest = process.env.NODE_ENV === "test";

    //this.connection = new Connection(clusterApiUrl(network), {
    this.connection = new Connection(process.env.RPC_API_CLUSTER, {
      httpAgent: isTest ? false : undefined,
      commitment: "confirmed",
    });

    const provider = new AnchorProvider(this.connection, wallet, { commitment: "confirmed" });
    setProvider(provider);

    console.log("program id: " + process.env.MEMECHAN_PROGRAM_ID);
    this.memechanProgram = new Program<MemechanSol>(IDL, new PublicKey(process.env.MEMECHAN_PROGRAM_ID!), provider);
  }
}
