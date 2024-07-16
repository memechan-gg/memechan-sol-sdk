import { AnchorProvider, Program, Wallet, setProvider } from "@coral-xyz/anchor";
import { Connection, Keypair, PublicKey } from "@solana/web3.js";
import { IDL as IDLv2, MemechanSol as MemechanSolv2 } from "./schema/v2/types/memechan_sol";

export interface MemechanClientV2ConfigArgs {
  wallet: Wallet;
  connection: Connection;
  heliusApiUrl?: string;
  simulationKeypair: Keypair;
  memeChanProgramId: string;
}

export class MemechanClientV2 {
  public wallet: Wallet;
  public connection: Connection;
  public memechanProgram: Program<MemechanSolv2>;
  public anchorProvider: AnchorProvider;
  public heliusApiUrl: string | null;
  public simulationKeypair: Keypair;

  constructor(config: MemechanClientV2ConfigArgs) {
    const { wallet, connection, heliusApiUrl, memeChanProgramId } = config;

    this.wallet = wallet;
    this.connection = connection;
    this.heliusApiUrl = heliusApiUrl ?? null;

    const provider = new AnchorProvider(this.connection, wallet, {
      commitment: "confirmed",
      preflightCommitment: "confirmed",
      skipPreflight: true,
    });
    setProvider(provider);
    this.anchorProvider = provider;

    console.log(`MemechanClientV2 init. Program id: ${memeChanProgramId}, RPC: ${connection.rpcEndpoint}`);

    // Initialize the program with v2 schema
    this.memechanProgram = new Program<MemechanSolv2>(IDLv2, new PublicKey(memeChanProgramId), provider);
    this.simulationKeypair = config.simulationKeypair;
  }
}
