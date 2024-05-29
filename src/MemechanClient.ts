import { AnchorProvider, Program, Wallet, setProvider } from "@coral-xyz/anchor";
import { Connection, Keypair, PublicKey } from "@solana/web3.js";
import { IDL, MemechanSol } from "./schema/types/memechan_sol";
import { MEMECHAN_PROGRAM_ID } from "./config/config";

export interface MemechanClientConfigArgs {
  wallet: Wallet;
  connection: Connection;
  heliusApiUrl: string;
  simulationKeypair: Keypair;
}

export class MemechanClient {
  public wallet: Wallet;
  public connection: Connection;
  public memechanProgram: Program<MemechanSol>;
  public anchorProvider: AnchorProvider;
  public heliusApiUrl: string;
  public simulationKeypair: Keypair;

  constructor(config: MemechanClientConfigArgs) {
    const { wallet, connection, heliusApiUrl } = config;

    this.wallet = wallet;
    this.connection = connection;
    this.heliusApiUrl = heliusApiUrl;
    const provider = new AnchorProvider(this.connection, wallet, {
      commitment: "confirmed",
      preflightCommitment: "confirmed",
      skipPreflight: true,
    });
    setProvider(provider);
    this.anchorProvider = provider;

    console.log("MemechanClient init. Program id: " + MEMECHAN_PROGRAM_ID + " Rpc: " + connection.rpcEndpoint);

    this.memechanProgram = new Program<MemechanSol>(IDL, new PublicKey(MEMECHAN_PROGRAM_ID), provider);
    this.simulationKeypair = config.simulationKeypair;
  }
}
