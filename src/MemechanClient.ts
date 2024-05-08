import { AnchorProvider, Program, Wallet, setProvider } from "@coral-xyz/anchor";
import { Amm, IDL as AmmIDL } from "./common/types/amm";
import { MemechanSol, IDL as MemechanSolIDL } from "./common/types/memechan_sol";
import { Cluster, Connection, PublicKey, clusterApiUrl } from "@solana/web3.js";

export class MemechanClient {
  public connection: Connection;
  public ammProgram: Program<Amm>;
  public memechanProgram: Program<MemechanSol>;

  constructor(
    private wallet: Wallet,
    network: Cluster = process.env.NETWORK as Cluster,
  ) {
    this.wallet = wallet;
    const isTest = process.env.NODE_ENV === "test";

    this.connection = new Connection(clusterApiUrl(network), {
      httpAgent: isTest ? false : undefined,
      commitment: "confirmed",
    });

    const provider = new AnchorProvider(this.connection, wallet, { commitment: "confirmed" });
    setProvider(provider);

    this.ammProgram = new Program<Amm>(AmmIDL, new PublicKey(process.env.AMM_PROGRAM_ID!), provider);
    this.memechanProgram = new Program<MemechanSol>(
      MemechanSolIDL,
      new PublicKey(process.env.MEMECHAN_PROGRAM_ID!),
      provider,
    );
  }
}
