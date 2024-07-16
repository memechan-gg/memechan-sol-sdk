import { AnchorProvider, Program, Wallet, setProvider } from "@coral-xyz/anchor";
import { Connection, Keypair, PublicKey } from "@solana/web3.js";
import { IDL, MemechanSol } from "./schema/types/memechan_sol";

export interface MemechanClientConfigArgs {
  wallet: Wallet;
  connection: Connection;
  heliusApiUrl?: string;
  simulationKeypair: Keypair;
  memeChanProgramId: string;
}

export class MemechanClient {
  public wallet: Wallet;
  public connection: Connection;
  public memechanProgram: Program<MemechanSol>;
  public anchorProvider: AnchorProvider;
  public heliusApiUrl: string | null;
  public simulationKeypair: Keypair;

  constructor(config: MemechanClientConfigArgs) {
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

    // console.log("MemechanClient init. Program id: " + MEMECHAN_PROGRAM_ID + " Rpc: " + connection.rpcEndpoint);

    this.memechanProgram = new Program<MemechanSol>(IDL, new PublicKey(memeChanProgramId), provider);
    this.simulationKeypair = config.simulationKeypair;
  }
}
